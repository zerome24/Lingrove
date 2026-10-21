import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Calculator, ArrowRight, Info, CheckCircle2 } from 'lucide-react'
import api from '../services/api'

interface CostCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CostCalculatorModal: React.FC<CostCalculatorModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    material_cost: 120,
    labor_cost: 180,
    finishing_cost: 40,
    packaging_cost: 25,
    transport_cost: 35,
    other_expenses: 10,
    desired_margin_percentage: 25
  })

  const [result, setResult] = useState<{
    total_cost: number
    desired_margin_percentage: number
    suggested_selling_price: number
    estimated_profit: number
    disclaimer: string
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }))
  }

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.desired_margin_percentage < 0 || formData.desired_margin_percentage >= 100) {
      setError(t('calculator.margin_hint'))
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/calculator', formData)
      setResult(res.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Calculation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-2xl border border-[#F3E9D5] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-[#FAF8F1] transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F3E9D5] text-[#24452D] flex items-center justify-center">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-2xl text-[#24452D]">
              {t('calculator.title')}
            </h2>
            <p className="text-xs text-gray-600">
              {t('calculator.subtitle')}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('calculator.raw_cost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="material_cost"
                value={formData.material_cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('calculator.labor_cost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="labor_cost"
                value={formData.labor_cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('calculator.finishing_cost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="finishing_cost"
                value={formData.finishing_cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('calculator.packaging_cost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="packaging_cost"
                value={formData.packaging_cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('calculator.transport_cost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="transport_cost"
                value={formData.transport_cost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('calculator.other_cost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="other_expenses"
                value={formData.other_expenses}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-sm"
              />
            </div>
          </div>

          <div className="bg-[#FAF8F1] p-4 rounded-2xl border border-[#F3E9D5]">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-[#24452D]">
                {t('calculator.margin')}
              </label>
              <span className="font-display font-extrabold text-sm text-[#E8A64A]">
                {formData.desired_margin_percentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="75"
              step="1"
              name="desired_margin_percentage"
              value={formData.desired_margin_percentage}
              onChange={handleChange}
              className="w-full accent-[#65834C]"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Formula: Price = Total Cost / (1 - Margin % / 100)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>{t('calculator.calc_btn')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Calculation Results Card */}
        {result && (
          <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-xl shadow-xs">
                <span className="text-[11px] text-gray-500 block mb-0.5">{t('calculator.total_cost')}</span>
                <span className="font-display font-bold text-lg text-gray-800">
                  ₹{result.total_cost}
                </span>
              </div>
              <div className="p-3 bg-[#24452D] text-white rounded-xl shadow-sm">
                <span className="text-[11px] text-[#F3E9D5] block mb-0.5">{t('calculator.suggested_price')}</span>
                <span className="font-display font-extrabold text-2xl text-[#E8A64A]">
                  ₹{result.suggested_selling_price}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-xs">
                <span className="text-[11px] text-gray-500 block mb-0.5">{t('calculator.estimated_profit')}</span>
                <span className="font-display font-bold text-lg text-emerald-600">
                  +₹{result.estimated_profit}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[11px] text-gray-600">
              <Info size={14} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>{result.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
