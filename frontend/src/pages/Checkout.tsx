import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck, Lock, ArrowRight, CheckCircle2, AlertCircle,
  Truck, Store, ExternalLink, RefreshCw, MessageSquare
} from 'lucide-react'
import api from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import {
  DEFAULT_WHATSAPP_NUMBER,
  createWhatsAppChatUrl,
  orderToWhatsAppDetails,
  WhatsAppOrderDetails
} from '../utils/whatsapp'
import { BusinessConfig, Order } from '../types'

export const Checkout: React.FC = () => {
  const { t } = useTranslation()
  const { cart, clearCart, isGuest } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    whatsapp_number: DEFAULT_WHATSAPP_NUMBER,
    whatsapp_formatted: '+91 90590 76675',
    business_name: 'Lingrove',
    subtitle: 'Lingala Bamboo Products at CMRTC',
    tagline: 'Learn. Create. Sell. Grow Together.',
    pickup_address: 'CMRTC Lingala Bamboo Workshop, Kandlakoya, Hyderabad, Telangana 501401',
    support_phone: '+91 90590 76675',
    support_email: 'contact@lingrove.org'
  })

  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_phone: user?.phone || '',
    delivery_type: 'delivery' as 'delivery' | 'pickup',
    shipping_address: '',
    shipping_city: 'Hyderabad',
    shipping_state: 'Telangana',
    shipping_pincode: '501401',
    notes: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null)

  // Fetch business configuration from centralized backend endpoint
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config/business')
        if (res.data) {
          setBusinessConfig(res.data)
        }
      } catch {
        // Fallback to default in state
      }
    }
    fetchConfig()
  }, [])

  // Auto-populate when user auth state updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.full_name || '',
        customer_phone: prev.customer_phone || user.phone || ''
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isPickup = formData.delivery_type === 'pickup'
  const effectiveShippingFee = isPickup || cart.subtotal >= 999 ? 0 : 99
  const taxAmount = Math.round(cart.subtotal * 0.05)
  const grandTotal = cart.subtotal + effectiveShippingFee + taxAmount

  const handlePlaceWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (cart.items.length === 0) {
      setError('Your cart is empty. Please add items before placing an order.')
      return
    }

    if (!formData.customer_name.trim()) {
      setError('Please provide your name.')
      return
    }

    if (!formData.customer_phone.trim()) {
      setError('Please provide your phone number so the artisan can reach you on WhatsApp.')
      return
    }

    if (!isPickup && !formData.shipping_address.trim()) {
      setError('Please provide your delivery address, or select CMRTC Workshop Pickup.')
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        delivery_type: formData.delivery_type,
        shipping_name: formData.customer_name.trim(),
        shipping_phone: formData.customer_phone.trim(),
        shipping_address: isPickup
          ? 'CMRTC Lingala Bamboo Workshop Pickup'
          : formData.shipping_address.trim(),
        shipping_city: isPickup ? 'Hyderabad' : formData.shipping_city.trim(),
        shipping_state: isPickup ? 'Telangana' : formData.shipping_state.trim(),
        shipping_pincode: isPickup ? '501401' : formData.shipping_pincode.trim(),
        payment_method: 'whatsapp',
        notes: formData.notes.trim() || undefined,
        guest_items: isGuest
          ? cart.items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }))
          : undefined
      }

      const res = await api.post('/orders', payload)
      const orderRecord: Order = res.data

      // Generate prefilled WhatsApp Click-to-Chat URL
      const waDetails: WhatsAppOrderDetails = orderToWhatsAppDetails(orderRecord)
      const url = createWhatsAppChatUrl(waDetails, businessConfig.whatsapp_number)

      setCreatedOrder(orderRecord)
      setWhatsAppUrl(url)

      // Open WhatsApp click-to-chat directly in new tab/window
      if (typeof window !== 'undefined') {
        window.open(url, '_blank', 'noopener,noreferrer')
      }

      // Clear current cart now that order request record has been created
      await clearCart()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to initialize WhatsApp order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Success State: Order Request Created ---
  if (createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-xs text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 uppercase tracking-wider mb-2">
              Order Request Created • Awaiting Confirmation
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#24452D]">
              Order Request: {createdOrder.order_number}
            </h1>
            <p className="text-xs text-gray-600 max-w-lg mx-auto mt-2 leading-relaxed">
              Your order request has been logged. WhatsApp was opened in a new tab with your prefilled order message to the Lingala artisan team at <strong>{businessConfig.whatsapp_formatted}</strong>.
            </p>
          </div>

          {/* Action Callout */}
          <div className="p-4 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5] text-left space-y-3 max-w-lg mx-auto">
            <h3 className="font-display font-bold text-xs text-[#24452D] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#25D366]" />
              <span>Next Steps to Complete Your Order</span>
            </h3>
            <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                <strong>Press "Send" in WhatsApp:</strong> Please send the prefilled message that was generated for you.
              </li>
              <li>
                <strong>Direct Payment Coordination:</strong> The seller will confirm stock and share UPI / QR payment details directly with you on WhatsApp.
              </li>
              <li>
                <strong>Dispatch / Pickup:</strong> Once confirmed, your handcrafted bamboo items will be prepared for dispatch or pickup.
              </li>
            </ol>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {whatsAppUrl && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm transition-all"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Re-open WhatsApp Chat</span>
                <ExternalLink size={14} />
              </a>
            )}

            <Link
              to={`/orders/${createdOrder.id}${createdOrder.access_token ? `?token=${encodeURIComponent(createdOrder.access_token)}` : ''}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-xs transition-all shadow-sm"
            >
              <span>View Order Details</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all"
            >
              <span>Continue Shopping</span>
            </Link>
          </div>

          <p className="text-[11px] text-gray-400">
            Order Reference: <code className="font-mono text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">{createdOrder.order_number}</code>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[#24452D]">
          {t('checkout.title')}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
          <Lock size={12} className="text-[#65834C]" />
          <span>Direct WhatsApp Ordering • No online payment gateway required</span>
        </div>
      </div>

      {isGuest && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
          <div>
            <span className="font-bold">Guest Checkout Active:</span> You can place your order request directly without creating an account.
          </div>
          <Link to="/login" className="text-amber-800 underline font-bold hover:text-amber-950 flex-shrink-0">
            Sign In Instead
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-800 text-xs font-semibold border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceWhatsAppOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Customer & Delivery Form (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-xs space-y-6">
          <h2 className="font-display font-bold text-xl text-[#24452D]">
            {t('checkout.shipping_info') || 'Customer & Delivery Information'}
          </h2>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('checkout.full_name') || 'Your Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="e.g. Ramesh Reddy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('checkout.phone') || 'WhatsApp Phone Number'} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
                required
              />
            </div>
          </div>

          {/* Fulfillment Preference: Delivery vs CMRTC Workshop Pickup */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Delivery Preference <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  !isPickup ? 'border-[#24452D] bg-[#FAF8F1]' : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_type"
                  value="delivery"
                  checked={!isPickup}
                  onChange={handleChange}
                  className="mt-0.5 accent-[#24452D]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#24452D]">
                    <Truck size={14} />
                    <span>Courier / Local Delivery</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Dispatched to your home or office address (Free for orders ₹999+)
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                  isPickup ? 'border-[#24452D] bg-[#FAF8F1]' : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="delivery_type"
                  value="pickup"
                  checked={isPickup}
                  onChange={handleChange}
                  className="mt-0.5 accent-[#24452D]"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#24452D]">
                    <Store size={14} />
                    <span>CMRTC Workshop Pickup</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Collect directly from CMRTC Campus / Village Workshop (Free Pickup)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Conditional Address Fields */}
          {!isPickup ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('checkout.address') || 'Delivery Address'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  placeholder="Door/Flat No., Street, Landmark, Village or City"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
                  required={!isPickup}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('checkout.city') || 'City / Town'}
                  </label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={formData.shipping_city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('checkout.state') || 'State'}
                  </label>
                  <input
                    type="text"
                    name="shipping_state"
                    value={formData.shipping_state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t('checkout.pincode') || 'Postal PIN Code'}
                  </label>
                  <input
                    type="text"
                    name="shipping_pincode"
                    value={formData.shipping_pincode}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5] space-y-1.5 text-xs text-gray-700">
              <span className="font-bold text-[#24452D] block flex items-center gap-1.5">
                <Store size={14} className="text-[#65834C]" />
                Pickup Location Details
              </span>
              <p className="text-[11px] leading-relaxed text-gray-600">
                {businessConfig.pickup_address}
              </p>
              <p className="text-[10px] text-emerald-800 font-semibold">
                No delivery charge will be added to your order.
              </p>
            </div>
          )}

          {/* Customer Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t('checkout.notes') || 'Order Notes / Customization Requests (Optional)'}
            </label>
            <textarea
              rows={2}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special size, festival date deadline, or packaging instructions..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm"
            />
          </div>

          {/* Payment Coordination Transparency Box */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h3 className="font-display font-bold text-sm text-[#24452D] flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-[#65834C]" />
              <span>Direct Payment Coordination via WhatsApp</span>
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Lingrove works directly with village artisans. You do not need to enter credit cards or banking passwords on this website. After submitting, your order message opens on WhatsApp with the official contact (<strong>{businessConfig.whatsapp_formatted}</strong>), where you can coordinate payment directly via UPI, QR code, or Cash on Delivery.
            </p>
          </div>
        </div>

        {/* Order Summary & Submit (4 Cols) */}
        <div className="lg:col-span-4 bg-[#FAF8F1] rounded-3xl p-6 border border-[#F3E9D5] shadow-xs space-y-5">
          <h3 className="font-display font-bold text-lg text-[#24452D]">
            Order Summary ({cart.items.length} items)
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-[#F3E9D5] pr-1">
            {cart.items.map((item) => {
              const product = item.product
              const unitPrice = product.discount_price && product.discount_price > 0
                ? product.discount_price
                : product.price
              const lineTotal = unitPrice * item.quantity

              return (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-[#263328] truncate">{product.title}</p>
                    <p className="text-[11px] text-gray-500">
                      {item.quantity} × ₹{unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <span className="font-bold text-[#24452D] flex-shrink-0">
                    ₹{lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs text-gray-700 pt-3 border-t border-[#F3E9D5]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-bold text-[#65834C]">
                {effectiveShippingFee === 0 ? 'FREE' : `₹${effectiveShippingFee}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Handicraft GST (5%)</span>
              <span className="font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2 border-t border-[#F3E9D5]">
            <span className="font-display font-bold text-base text-[#24452D]">Grand Total</span>
            <span className="font-display font-extrabold text-2xl text-[#24452D]">
              ₹{grandTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || cart.items.length === 0}
            className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Preparing Order...</span>
              </>
            ) : (
              <>
                <WhatsAppIcon className="w-5 h-5 fill-white" />
                <span>Order via WhatsApp ({businessConfig.whatsapp_formatted})</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            By placing this request, a prefilled WhatsApp message will open. Press "Send" in WhatsApp to confirm with the artisan.
          </p>
        </div>
      </form>
    </div>
  )
}
