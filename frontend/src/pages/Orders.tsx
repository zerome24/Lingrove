import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Package, Clock, ChevronRight, CheckCircle2, Truck, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { Order } from '../types'
import { useAuth } from '../context/AuthContext'

export const Orders: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const res = await api.get('/orders')
        setOrders(res.data)
      } catch (err) {
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Confirmed</span>
      case 'processing':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Processing</span>
      case 'shipped':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Shipped</span>
      case 'delivered':
        return <span className="bg-emerald-200 text-emerald-900 text-[11px] font-bold px-2.5 py-1 rounded-full">Delivered</span>
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Cancelled</span>
      default:
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full">Pending</span>
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm font-bold text-gray-500">Loading orders...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-[#24452D]">
          {t('orders.title')}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Track fulfillment status and review purchase receipts
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#F3E9D5] space-y-3">
          <Package size={44} className="text-gray-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-gray-700">No Orders Yet</h3>
          <p className="text-xs text-gray-500">You have not placed any orders through Lingrove.</p>
          <Link
            to="/products"
            className="inline-block px-5 py-2.5 bg-[#24452D] text-white rounded-xl text-xs font-bold"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="bg-white rounded-3xl p-6 border border-[#F3E9D5] shadow-xs hover:shadow-bamboo transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-base text-[#24452D]">
                    {o.order_number}
                  </span>
                  {getStatusBadge(o.status)}
                </div>

                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>Placed on {new Date(o.created_at).toLocaleDateString()}</p>
                  <p>Deliver to: {o.shipping_name} ({o.shipping_city}, {o.shipping_state})</p>
                  <p className="text-[#65834C] font-semibold">{o.items.length} items ordered</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">Total</span>
                  <span className="font-display font-extrabold text-xl text-[#24452D]">
                    ₹{o.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  to={`/orders/${o.id}`}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF8F1] hover:bg-[#F3E9D5] text-[#24452D] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#F3E9D5]"
                >
                  <span>{t('orders.order_details')}</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
