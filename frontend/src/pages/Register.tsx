import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { User, Mail, Lock, Phone, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { LingroveLogo } from '../components/LingroveLogo'

export const Register: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'artisan' ? 'artisan' : 'customer'

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: defaultRole,
    preferred_language: i18n.language || 'en'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      const res = await api.post('/auth/register', formData)
      login(res.data.access_token, res.data.user)
      if (formData.role === 'artisan') {
        navigate('/profile')
      } else {
        navigate('/products')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#F3E9D5] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <LingroveLogo className="justify-center" />
          <h2 className="font-display font-extrabold text-2xl text-[#24452D] pt-2">
            {t('auth.register_title')}
          </h2>
          <p className="text-xs text-gray-500">
            {t('auth.register_subtitle')}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.role')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'customer' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  formData.role === 'customer'
                    ? 'bg-[#24452D] text-white border-[#24452D]'
                    : 'bg-[#FAF8F1] text-gray-700 border-gray-200'
                }`}
              >
                {t('auth.role_customer')}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'artisan' })}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  formData.role === 'artisan'
                    ? 'bg-[#24452D] text-white border-[#24452D]'
                    : 'bg-[#FAF8F1] text-gray-700 border-gray-200'
                }`}
              >
                {t('auth.role_artisan')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.full_name')}</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 94401 23456"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Language</label>
            <select
              name="preferred_language"
              value={formData.preferred_language}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white"
            >
              <option value="en">English</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            {loading ? <span>{t('auth.register_btn')}...</span> : <span>{t('auth.register_btn')}</span>}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          <span>{t('nav.login')}? </span>
          <Link to="/login" className="font-bold text-[#24452D] hover:underline">
            {t('auth.login_btn')}
          </Link>
        </div>
      </div>
    </div>
  )
}
