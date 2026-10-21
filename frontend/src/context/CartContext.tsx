import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api from '../services/api'
import { CartItem, CartSummary, Product } from '../types'
import { useAuth } from './AuthContext'

const GUEST_CART_KEY = 'lingrove_guest_cart'

interface StoredGuestItem {
  productId: number
  quantity: number
  product?: Product
}

interface CartContextType {
  cart: CartSummary
  isLoading: boolean
  totalItems: number
  isGuest: boolean
  addToCart: (productId: number, quantity?: number, productData?: Product) => Promise<boolean>
  updateQuantity: (itemIdOrProductId: number, quantity: number) => Promise<void>
  removeFromCart: (itemIdOrProductId: number) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

const defaultCart: CartSummary = {
  items: [],
  subtotal: 0,
  shipping_fee: 0,
  total: 0
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const getStoredGuestCart = (): StoredGuestItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY)
    if (!raw) return []
    return JSON.parse(raw) || []
  } catch {
    return []
  }
}

const setStoredGuestCart = (items: StoredGuestItem[]) => {
  try {
    if (items.length === 0) {
      localStorage.removeItem(GUEST_CART_KEY)
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
    }
  } catch {
    // Ignore storage quota errors
  }
}

const computeGuestCartSummary = (guestItems: StoredGuestItem[]): CartSummary => {
  let subtotal = 0
  const items: CartItem[] = []

  guestItems.forEach((gi, idx) => {
    if (!gi.product) return
    const unitPrice = gi.product.discount_price && gi.product.discount_price > 0
      ? gi.product.discount_price
      : gi.product.price

    subtotal += unitPrice * gi.quantity
    items.push({
      id: gi.productId, // Use productId as synthetic ID for guest cart
      product_id: gi.productId,
      quantity: gi.quantity,
      product: gi.product
    })
  })

  const shipping_fee = (subtotal >= 999 || subtotal === 0) ? 0 : 99
  const tax_amount = Math.round(subtotal * 0.05 * 100) / 100
  const total = Math.round((subtotal + shipping_fee + tax_amount) * 100) / 100

  return {
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    shipping_fee,
    tax_amount,
    total
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartSummary>(defaultCart)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const prevUserIdRef = useRef<number | null>(null)

  const loadGuestCart = useCallback(async () => {
    const stored = getStoredGuestCart()
    if (stored.length === 0) {
      setCart(defaultCart)
      return
    }

    // Hydrate any items missing product details
    const hydrated: StoredGuestItem[] = []
    let needsUpdate = false

    for (const item of stored) {
      if (item.product && item.product.title) {
        hydrated.push(item)
      } else {
        try {
          const res = await api.get(`/products/${item.productId}`)
          hydrated.push({ ...item, product: res.data })
          needsUpdate = true
        } catch {
          // If product deleted or unavailable, omit it
          needsUpdate = true
        }
      }
    }

    if (needsUpdate) {
      setStoredGuestCart(hydrated)
    }
    setCart(computeGuestCartSummary(hydrated))
  }, [])

  const refreshCart = useCallback(async () => {
    if (!user) {
      await loadGuestCart()
      return
    }

    try {
      setIsLoading(true)
      const res = await api.get('/cart')
      setCart(res.data)
    } catch {
      // Ignore network errors
    } finally {
      setIsLoading(false)
    }
  }, [user, loadGuestCart])

  // Handle Auth state changes & Guest-to-Account Cart Merging
  useEffect(() => {
    const handleAuthChange = async () => {
      const currentUserId = user?.id || null
      const prevUserId = prevUserIdRef.current
      prevUserIdRef.current = currentUserId

      if (user) {
        // User just logged in or switched
        const guestItems = getStoredGuestCart()
        if (guestItems.length > 0) {
          try {
            setIsLoading(true)
            const mergePayload = {
              items: guestItems.map((gi) => ({
                product_id: gi.productId,
                quantity: gi.quantity
              }))
            }
            const res = await api.post('/cart/merge', mergePayload)
            localStorage.removeItem(GUEST_CART_KEY)
            setCart(res.data)
          } catch {
            // Fallback to normal fetch if merge fails
            const res = await api.get('/cart')
            setCart(res.data)
          } finally {
            setIsLoading(false)
          }
        } else {
          // No guest items to merge, fetch fresh user cart
          await refreshCart()
        }
      } else {
        // User logged out: clear private cart from in-memory state
        if (prevUserId !== null) {
          setCart(defaultCart)
        } else {
          await loadGuestCart()
        }
      }
    }

    handleAuthChange()
  }, [user, refreshCart, loadGuestCart])

  const addToCart = async (
    productId: number,
    quantity: number = 1,
    productData?: Product
  ): Promise<boolean> => {
    if (user) {
      try {
        await api.post('/cart/items', { product_id: productId, quantity })
        await refreshCart()
        return true
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Could not add item to cart')
        return false
      }
    } else {
      // Guest cart logic
      try {
        let p = productData
        if (!p) {
          const res = await api.get(`/products/${productId}`)
          p = res.data
        }

        if (!p) return false
        if (p.stock < quantity) {
          alert(`Only ${p.stock} items currently in stock`)
          return false
        }

        const stored = getStoredGuestCart()
        const existingIndex = stored.findIndex((i) => i.productId === productId)

        if (existingIndex >= 0) {
          const newQty = stored[existingIndex].quantity + quantity
          if (p.stock < newQty) {
            alert(`Cannot add more than ${p.stock} items available in stock`)
            return false
          }
          stored[existingIndex].quantity = newQty
          stored[existingIndex].product = p
        } else {
          stored.push({ productId, quantity, product: p })
        }

        setStoredGuestCart(stored)
        setCart(computeGuestCartSummary(stored))
        return true
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Could not add item to guest cart')
        return false
      }
    }
  }

  const updateQuantity = async (itemIdOrProductId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemIdOrProductId)
      return
    }

    if (user) {
      try {
        await api.put(`/cart/items/${itemIdOrProductId}`, { quantity })
        await refreshCart()
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Could not update quantity')
      }
    } else {
      const stored = getStoredGuestCart()
      const item = stored.find((i) => i.productId === itemIdOrProductId)
      if (item && item.product) {
        if (quantity > item.product.stock) {
          alert(`Requested quantity exceeds available stock of ${item.product.stock}`)
          return
        }
        item.quantity = quantity
        setStoredGuestCart(stored)
        setCart(computeGuestCartSummary(stored))
      }
    }
  }

  const removeFromCart = async (itemIdOrProductId: number) => {
    if (user) {
      try {
        await api.delete(`/cart/items/${itemIdOrProductId}`)
        await refreshCart()
      } catch {
        // Ignore
      }
    } else {
      const stored = getStoredGuestCart().filter((i) => i.productId !== itemIdOrProductId)
      setStoredGuestCart(stored)
      setCart(computeGuestCartSummary(stored))
    }
  }

  const clearCart = async () => {
    if (user) {
      try {
        await api.delete('/cart/clear')
      } catch {
        // Ignore
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY)
    }
    setCart(defaultCart)
  }

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        totalItems,
        isGuest: !user,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
