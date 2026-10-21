import { Order } from '../types'

export const DEFAULT_WHATSAPP_NUMBER = '919059076675'

/**
 * Normalizes phone number to international WhatsApp format for India.
 * Strips non-digits, prepends 91 if 10 digits.
 */
export const normalizeWhatsAppNumber = (rawNumber?: string): string => {
  if (!rawNumber) return DEFAULT_WHATSAPP_NUMBER
  const digits = rawNumber.replace(/\D/g, '')
  if (digits.length === 10) {
    return `91${digits}`
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return digits
  } else if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`
  }
  return digits || DEFAULT_WHATSAPP_NUMBER
}

export const formatDisplayWhatsAppNumber = (num: string = DEFAULT_WHATSAPP_NUMBER): string => {
  const norm = normalizeWhatsAppNumber(num)
  if (norm.length === 12 && norm.startsWith('91')) {
    return `+91 ${norm.slice(2, 7)} ${norm.slice(7)}`
  }
  return `+${norm}`
}

export interface WhatsAppOrderDetails {
  orderNumber: string
  customerName: string
  customerPhone?: string
  deliveryType: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryCity?: string
  deliveryPincode?: string
  items: Array<{
    title: string
    sku?: string
    quantity: number
    unitPrice: number
    totalPrice: number
    customization?: string
  }>
  subtotal: number
  shippingFee: number
  taxAmount?: number
  totalAmount: number
  notes?: string
}

/**
 * Formats a clean, readable text message for WhatsApp with complete Lingrove branding and order breakdown.
 */
export const buildWhatsAppOrderMessage = (order: WhatsAppOrderDetails): string => {
  const lines: string[] = []

  lines.push(`🌿 *LINGROVE — Lingala Bamboo Products at CMRTC*`)
  lines.push(`_Learn. Create. Sell. Grow Together._`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`📦 *NEW ORDER REQUEST: ${order.orderNumber}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(``)
  lines.push(`👤 *CUSTOMER DETAILS:*`)
  lines.push(`• *Name:* ${order.customerName}`)
  if (order.customerPhone) {
    lines.push(`• *Phone:* ${order.customerPhone}`)
  }
  lines.push(`• *Fulfillment:* ${order.deliveryType === 'pickup' ? '🏫 Workshop Pickup at CMRTC' : '🚚 Local / Courier Delivery'}`)
  
  if (order.deliveryType === 'delivery' && order.deliveryAddress) {
    lines.push(`• *Address:* ${order.deliveryAddress}, ${order.deliveryCity || ''} ${order.deliveryPincode ? `- ${order.deliveryPincode}` : ''}`.trim())
  }
  lines.push(``)

  lines.push(`🛍️ *ORDER ITEMS:*`)
  order.items.forEach((item, index) => {
    const skuTag = item.sku ? ` [${item.sku}]` : ''
    lines.push(`${index + 1}. *${item.title}*${skuTag}`)
    lines.push(`   Qty: ${item.quantity} × ₹${item.unitPrice.toLocaleString('en-IN')} = *₹${item.totalPrice.toLocaleString('en-IN')}*`)
    if (item.customization) {
      lines.push(`   _Customization: ${item.customization}_`)
    }
  })
  lines.push(``)

  lines.push(`💰 *PAYMENT & PRICE SUMMARY:*`)
  lines.push(`• Subtotal: ₹${order.subtotal.toLocaleString('en-IN')}`)
  if (order.shippingFee > 0) {
    lines.push(`• Delivery Charges: ₹${order.shippingFee.toLocaleString('en-IN')}`)
  } else {
    lines.push(`• Delivery: FREE (Pickup or Order above ₹999)`)
  }
  if (order.taxAmount && order.taxAmount > 0) {
    lines.push(`• GST (5% Bamboo Handicrafts): ₹${order.taxAmount.toLocaleString('en-IN')}`)
  }
  lines.push(`• *Grand Total: ₹${order.totalAmount.toLocaleString('en-IN')}*`)
  lines.push(`• *Payment Mode:* Direct Seller Coordination (WhatsApp / UPI / COD)`)

  if (order.notes && order.notes.trim()) {
    lines.push(``)
    lines.push(`📝 *Customer Notes:* ${order.notes.trim()}`)
  }

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`🙏 _Namaskaram! Please confirm product availability, delivery timeline, and share your UPI / bank payment details to proceed._`)

  return lines.join('\n')
}

/**
 * Generates the safe, URL-encoded click-to-chat WhatsApp URL
 */
export const createWhatsAppChatUrl = (
  details: WhatsAppOrderDetails,
  destinationNumber: string = DEFAULT_WHATSAPP_NUMBER
): string => {
  const cleanNumber = normalizeWhatsAppNumber(destinationNumber)
  const message = buildWhatsAppOrderMessage(details)
  const encodedText = encodeURIComponent(message)
  return `https://wa.me/${cleanNumber}?text=${encodedText}`
}

/**
 * Helper to convert backend Order object into WhatsAppOrderDetails
 */
export const orderToWhatsAppDetails = (order: Order): WhatsAppOrderDetails => {
  return {
    orderNumber: order.order_number,
    customerName: order.customer_name || order.shipping_name || 'Guest Customer',
    customerPhone: order.customer_phone || order.shipping_phone,
    deliveryType: (order.delivery_type as 'delivery' | 'pickup') || 'delivery',
    deliveryAddress: order.shipping_address,
    deliveryCity: order.shipping_city,
    deliveryPincode: order.shipping_pincode,
    items: (order.items || []).map((item) => ({
      title: item.product?.title || `Product #${item.product_id}`,
      sku: item.product?.sku,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      totalPrice: item.total_price,
      customization: item.product?.customization_options
    })),
    subtotal: (order.total_amount || 0) - (order.shipping_fee || 0) - (order.tax_amount || 0),
    shippingFee: order.shipping_fee || 0,
    taxAmount: order.tax_amount || 0,
    totalAmount: order.total_amount || 0,
    notes: order.notes
  }
}

// Backward-compatible alias for existing components
export const LINGROVE_WHATSAPP_NUMBER = DEFAULT_WHATSAPP_NUMBER

export const openWhatsAppUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

export const buildOrderWhatsAppUrl = (order: Order, destinationNumber?: string): string => {
  const details = orderToWhatsAppDetails(order)
  return createWhatsAppChatUrl(details, destinationNumber || DEFAULT_WHATSAPP_NUMBER)
}

export const buildCartWhatsAppUrl = (
  cart: { items: any[]; subtotal: number; shipping_fee: number; total: number },
  customerName?: string,
  customerPhone?: string,
  destinationNumber?: string
): string => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  const orderNumber = `LNG-WA-${dateStr}-${randomSuffix}`

  const details: WhatsAppOrderDetails = {
    orderNumber,
    customerName: customerName || 'Valued Customer',
    customerPhone: customerPhone,
    deliveryType: 'delivery',
    items: (cart.items || []).map((ci) => {
      const p = ci.product || {}
      const unitPrice = p.discount_price && p.discount_price > 0 ? p.discount_price : p.price || 0
      return {
        title: p.title || `Product #${ci.product_id}`,
        sku: p.sku,
        quantity: ci.quantity,
        unitPrice: unitPrice,
        totalPrice: unitPrice * ci.quantity,
        customization: p.customization_options
      }
    }),
    subtotal: cart.subtotal,
    shippingFee: cart.shipping_fee,
    taxAmount: Math.round(cart.subtotal * 0.05),
    totalAmount: cart.total + Math.round(cart.subtotal * 0.05),
    notes: ''
  }

  return createWhatsAppChatUrl(details, destinationNumber || DEFAULT_WHATSAPP_NUMBER)
}
