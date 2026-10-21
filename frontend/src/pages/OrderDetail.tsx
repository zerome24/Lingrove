import React, { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, CheckCircle2, Clock, Truck, Package, ShieldCheck,
  AlertCircle, AlertTriangle
} from 'lucide-react'
import api from '../services/api'
import { Order } from '../types'
import { useAuth } from '../context/AuthContext'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import { buildOrderWhatsAppUrl, openWhatsAppUrl, LINGROVE_WHATSAPP_NUMBER } from '../utils/whatsapp'

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const isSuccessRedirect = searchParams.get('success') === 'true'

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const token = searchParams.get('token')
      const url = token ? `/orders/${id}?token=${encodeURIComponent(token)}` : `/orders/${id}`
      const res = await api.get(url)
      setOrder(res.data)
    } catch (err) {
      console.error('Failed to load order', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id, searchParams])

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true)
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus })
      setOrder(res.data)
      alert(`Order status updated to ${newStatus}`)
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Status update failed')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return <div className="py-20 text-center font-bold text-gray-500 text-sm">Loading order details...</div>
  }

  if (!order) {
    return (
      <div className="py-20 text-center space-y-3">
        <h2 className="font-display font-bold text-xl text-gray-700">Order Not Found</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Please check the link in your WhatsApp receipt or sign in with your account to view your past orders.
        </p>
        <Link to="/orders" className="text-xs text-[#24452D] font-bold underline">
          Back to My Orders
        </Link>
      </div>
    )
  }

  const steps = ['confirmed', 'processing', 'shipped', 'delivered']
  const currentStepIndex = steps.indexOf(order.status.toLowerCase())

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#24452D] transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Orders</span>
      </Link>

      {/* Success banner if redirected from checkout or awaiting confirmation */}
      {(isSuccessRedirect || order.status === 'awaiting_confirmation') && (
        <div className="p-6 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <CheckCircle2 size={32} className="text-[#25D366] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-lg text-[#24452D]">
                Order Request Logged • Awaiting Seller Confirmation
              </h3>
              <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                Order reference: <strong>{order.order_number}</strong>. Items are reserved for 24 hours. Please ensure you pressed <em>Send</em> in WhatsApp (to <strong>+91 90590 76675</strong>) so the artisan team can confirm stock and coordinate payment directly with you.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openWhatsAppUrl(buildOrderWhatsAppUrl(order))}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white" />
            <span>Open in WhatsApp</span>
          </button>
        </div>
      )}

      {/* Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">
                Order Receipt
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                order.status === 'awaiting_confirmation'
                  ? 'bg-amber-100 text-amber-800'
                  : order.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#24452D] mt-1">
              {order.order_number}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleString()} • Payment: <strong className="capitalize">{order.payment_status.replace(/_/g, ' ')}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-left sm:text-right">
              <span className="text-xs text-gray-400 block">Total Order Amount</span>
              <span className="font-display font-extrabold text-2xl text-[#24452D]">
                ₹{order.total_amount.toLocaleString('en-IN')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => openWhatsAppUrl(buildOrderWhatsAppUrl(order))}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              title="Share order summary via WhatsApp"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
              <span>Share via WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Status Tracker Bar */}
        <div>
          <h4 className="font-display font-bold text-xs text-gray-500 uppercase tracking-wider mb-4">
            Fulfilment Progress
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {steps.map((st, idx) => {
              const isPastOrCurrent = currentStepIndex >= idx
              return (
                <div key={st} className="text-center">
                  <div
                    className={`h-2.5 rounded-full mb-2 transition-all ${
                      isPastOrCurrent ? 'bg-[#24452D]' : 'bg-gray-200'
                    }`}
                  />
                  <span
                    className={`text-[10px] sm:text-xs font-bold capitalize ${
                      isPastOrCurrent ? 'text-[#24452D]' : 'text-gray-400'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Admin / Artisan Status Control */}
        {(user?.role === 'admin' || user?.role === 'artisan') && (
          <div className="p-4 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-[#24452D]">
              Update Status (Artisan/Admin):
            </span>
            <div className="flex flex-wrap gap-2">
              {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((st) => (
                <button
                  key={st}
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-colors ${
                    order.status.toLowerCase() === st
                      ? 'bg-[#24452D] text-white'
                      : 'bg-white text-gray-700 hover:bg-[#F3E9D5] border border-gray-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items List */}
        <div>
          <h3 className="font-display font-bold text-base text-[#24452D] mb-4">
            Items Ordered ({order.items.length})
          </h3>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5]/60 text-xs"
              >
                <div>
                  <h4 className="font-bold text-[#263328]">{item.product?.title || `Product #${item.product_id}`}</h4>
                  <p className="text-gray-500">
                    ₹{item.unit_price} × {item.quantity} qty
                  </p>
                </div>
                <span className="font-bold text-[#24452D] text-sm">
                  ₹{item.total_price.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping and Payment Info Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-gray-800">Shipping Details</h4>
            <p className="text-gray-600">{order.shipping_name}</p>
            <p className="text-gray-600">{order.shipping_phone}</p>
            <p className="text-gray-600">{order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
          </div>

          <div className="space-y-1">
            <h4 className="font-bold text-gray-800">Payment Breakdown</h4>
            <p className="text-gray-600">Method: {order.payment_method.toUpperCase()}</p>
            <p className="text-gray-600">Payment Status: <span className="font-bold text-emerald-700">{order.payment_status}</span></p>
            <p className="text-gray-600">Shipping Fee: ₹{order.shipping_fee}</p>
            <p className="text-gray-600">Handicraft GST (5%): ₹{order.tax_amount}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
