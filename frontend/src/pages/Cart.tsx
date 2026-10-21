import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import { buildCartWhatsAppUrl, openWhatsAppUrl, LINGROVE_WHATSAPP_NUMBER } from '../utils/whatsapp'
import { getMatchingBambooProductImage } from '../utils/productImages'

export const Cart: React.FC = () => {
  const { t } = useTranslation()
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleWhatsAppOrder = () => {
    navigate('/checkout')
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#FAF8F1] border border-[#F3E9D5] text-[#24452D] flex items-center justify-center mx-auto">
          <ShoppingBag size={32} />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-[#24452D]">
          {t('cart.empty_cart')}
        </h2>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          {t('cart.empty_subtitle')}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#24452D] text-white font-bold text-xs hover:bg-[#31583b] transition-all shadow-sm"
        >
          <span>{t('cart.explore_btn')}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[#24452D]">
          {t('cart.title')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          {cart.items.length} unique handcrafted items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Cart Items List (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#F3E9D5] shadow-xs space-y-4">
          {cart.items.map((item) => {
            const product = item.product
            const imgFallback = getMatchingBambooProductImage(product.title, product.category?.slug)
            const imgUrl = product.images?.[0]?.image_url || imgFallback

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={imgUrl}
                    alt={product.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = imgFallback }}
                    className="w-20 h-20 object-cover rounded-2xl flex-shrink-0 bg-[#FAF8F1]"
                  />
                  <div>
                    <Link
                      to={`/products/${product.id}`}
                      className="font-display font-bold text-sm text-[#263328] hover:text-[#24452D] line-clamp-1"
                    >
                      {product.title}
                    </Link>
                    <p className="text-xs text-gray-500">₹{product.price} each</p>
                    {product.materials && (
                      <p className="text-[10px] text-[#65834C] font-semibold mt-0.5">{product.materials}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-[#FAF8F1]">
                    <button
                      onClick={() => {
                        if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1)
                        else removeFromCart(item.id)
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-white text-xs"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-gray-600 hover:bg-white text-xs"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-display font-extrabold text-base text-[#24452D] min-w-[70px] text-right">
                    ₹{(product.price * item.quantity).toLocaleString('en-IN')}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-[#FAF8F1] rounded-3xl p-6 border border-[#F3E9D5] shadow-xs space-y-4">
          <h3 className="font-display font-bold text-lg text-[#24452D]">
            Order Summary
          </h3>

          <div className="space-y-2.5 text-xs text-gray-700 pb-4 border-b border-[#F3E9D5]">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}</span>
              <span className="font-bold">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('cart.shipping')}</span>
              <span className="font-bold text-[#65834C]">
                {cart.shipping_fee === 0 ? t('cart.free_shipping') : `₹${cart.shipping_fee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Handicraft GST (5%)</span>
              <span className="font-bold">₹{Math.round(cart.subtotal * 0.05).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-1">
            <span className="font-display font-bold text-base text-[#24452D]">{t('cart.total')}</span>
            <span className="font-display font-extrabold text-2xl text-[#24452D]">
              ₹{(cart.total + Math.round(cart.subtotal * 0.05)).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              to="/checkout"
              className="w-full py-3.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-bamboo transition-all"
            >
              <span>{t('cart.checkout_btn')}</span>
              <ArrowRight size={16} />
            </Link>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>{t('cart.order_whatsapp')}</span>
            </button>
          </div>

          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            {t('cart.demo_notice')}
          </p>
        </div>
      </div>
    </div>
  )
}
