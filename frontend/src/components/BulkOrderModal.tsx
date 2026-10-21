import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Building2, Send, CheckCircle2 } from 'lucide-react'
import api from '../services/api'

interface BulkOrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export const BulkOrderModal: React.FC<BulkOrderModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    organization_name: '',
    contact_person: '',
    email: '',
    phone: '',
    product_type: 'Bamboo Baskets & Utility Containers',
    estimated_quantity: 100,
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'estimated_quantity' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      await api.post('/bulk-inquiries', formData)
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit enquiry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-2xl border border-[#F3E9D5] relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-[#FAF8F1] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#65834C]/20 text-[#24452D] flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[#24452D]">
              {t('bulk.title')}
            </h2>
            <p className="text-xs text-gray-600">
              {t('bulk.subtitle')}
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
            <CheckCircle2 size={48} className="text-emerald-600 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-emerald-900 mb-1">
              {t('bulk.success')}
            </h3>
            <p className="text-xs text-gray-600 mb-6">
              Thank you for supporting Lingala bamboo artisans at CMRTC.
            </p>
            <button
              onClick={() => {
                setSuccess(false)
                onClose()
              }}
              className="px-6 py-2.5 bg-[#24452D] text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('bulk.org_name')}
              </label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                placeholder="e.g. Eco Living Stores / ITC Green"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('bulk.contact')}
                </label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('bulk.phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('bulk.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="purchasing@company.org"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('bulk.product_type')}
                </label>
                <select
                  name="product_type"
                  value={formData.product_type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm bg-white"
                >
                  <option value="Bamboo Baskets & Containers">Bamboo Baskets & Containers</option>
                  <option value="Bamboo Furniture & Stools">Bamboo Furniture & Stools</option>
                  <option value="Bamboo Kitchenware & Cutlery">Bamboo Kitchenware & Cutlery</option>
                  <option value="Bamboo Lamps & Shades">Bamboo Lamps & Shades</option>
                  <option value="Custom Event Mementos & Crafts">Custom Event Mementos & Crafts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('bulk.quantity')}
                </label>
                <input
                  type="number"
                  min="20"
                  step="10"
                  name="estimated_quantity"
                  value={formData.estimated_quantity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('bulk.notes')}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Custom sizes, branding logos, delivery timeline..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>{t('bulk.submit_btn')}</span>
              <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
