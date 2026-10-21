import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { LingroveLogo } from '../components/LingroveLogo'

export const Login: React.FC = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/'

  const [email, setEmail] = useState('kavita@lingrove.org')
  const [password, setPassword] = useState('customer123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setLoading(true)
      const res = await api.post('/auth/login', { email, password })
      login(res.data.access_token, res.data.user)
      navigate(redirectPath)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#F3E9D5] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <LingroveLogo className="justify-center" />
          <h2 className="font-display font-extrabold text-2xl text-[#24452D] pt-2">
            {t('auth.login_title')}
          </h2>
          <p className="text-xs text-gray-500">
            {t('auth.login_subtitle')}
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
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-1 focus:ring-[#65834C]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {loading ? <span>{t('auth.login_btn')}...</span> : <span>{t('auth.login_btn')}</span>}
          </button>
        </form>

        {/* Quick Demo Credentials Autofill */}
        <div className="p-3.5 bg-[#FAF8F1] rounded-2xl border border-[#F3E9D5] text-[11px] space-y-2">
          <span className="font-bold text-[#24452D] block">{t('auth.demo_accounts')}:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('kavita@lingrove.org', 'customer123')}
              className="px-2.5 py-1 bg-white border border-[#F3E9D5] rounded-lg font-medium text-gray-700 hover:bg-[#F3E9D5] cursor-pointer"
            >
              Customer (Kavita)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('ramesh@lingrove.org', 'artisan123')}
              className="px-2.5 py-1 bg-white border border-[#F3E9D5] rounded-lg font-medium text-gray-700 hover:bg-[#F3E9D5] cursor-pointer"
            >
              Artisan (Ramesh)
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('admin@lingrove.org', 'admin123')}
              className="px-2.5 py-1 bg-white border border-[#F3E9D5] rounded-lg font-medium text-gray-700 hover:bg-[#F3E9D5] cursor-pointer"
            >
              Admin (CMRTC)
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <span>{t('nav.register')}? </span>
          <Link to="/register" className="font-bold text-[#24452D] hover:underline">
            {t('auth.register_btn')}
          </Link>
        </div>
      </div>
    </div>
  )
}
