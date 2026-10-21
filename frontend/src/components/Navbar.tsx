import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ShoppingBag, User, LogIn, UserPlus, Globe,
  Menu, X, Calculator, Building2, LogOut, ChevronDown
} from 'lucide-react'
import { LingroveLogo } from './LingroveLogo'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../services/api'

interface NavbarProps {
  onOpenCalculator: () => void
  onOpenBulk: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCalculator, onOpenBulk }) => {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { totalItems } = useCart()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/learn', label: t('nav.learn') },
    { to: '/products', label: t('nav.marketplace') },
    { to: '/gallery', label: t('nav.gallery') || 'Gallery' },
    { to: '/reviews', label: t('nav.reviews') },
  ]

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ]

  const handleLanguageChange = async (code: string) => {
    i18n.changeLanguage(code)
    setLangMenuOpen(false)
    if (user) {
      try {
        await api.put('/auth/me', { preferred_language: code })
      } catch (e) {
        // quiet sync
      }
    }
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F1]/95 backdrop-blur-md border-b border-[#F3E9D5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with CMRTC institutional partner */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LingroveLogo />
            <div className="hidden sm:flex items-center pl-3 border-l border-[#E2D5BA] py-1">
              <img
                src="/assets/cmrtc-logo.png"
                onError={(e) => { (e.target as HTMLImageElement).src = '/cmrtc logo.png' }}
                alt="CMR Technical Campus (CMRTC) Logo"
                className="h-9 w-auto max-w-[110px] object-contain hover:opacity-95 transition-opacity drop-shadow-xs"
                title="Incubated with CMR Technical Campus (CMRTC)"
              />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.to)
                    ? 'bg-[#24452D] text-white shadow-xs'
                    : 'text-[#263328] hover:text-[#24452D] hover:bg-[#F3E9D5]/60'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Quick Modals */}
            <button
              onClick={onOpenCalculator}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#65834C] hover:bg-[#F3E9D5]/60 transition-colors cursor-pointer"
            >
              <Calculator size={15} />
              <span>{t('nav.calculator')}</span>
            </button>

            <button
              onClick={onOpenBulk}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#24452D] hover:bg-[#F3E9D5]/60 transition-colors cursor-pointer"
            >
              <Building2 size={15} />
              <span>{t('nav.bulk')}</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#F3E9D5] text-xs font-bold text-[#263328] hover:bg-[#FAF8F1] transition-colors"
                title="Change Language"
              >
                <Globe size={15} className="text-[#65834C]" />
                <span className="uppercase">{i18n.language}</span>
                <ChevronDown size={13} className="text-gray-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-[#F3E9D5] py-2 z-50 animate-in fade-in zoom-in-95">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => handleLanguageChange(l.code)}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#FAF8F1] ${
                        i18n.language === l.code
                          ? 'font-bold text-[#24452D] bg-[#F3E9D5]/40'
                          : 'text-gray-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-gray-400 uppercase">{l.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping Cart Icon with Badge */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-white border border-[#F3E9D5] text-[#24452D] hover:bg-[#FAF8F1] transition-colors"
              aria-label="View shopping cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E8A64A] text-[#24452D] font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl bg-white border border-[#F3E9D5] hover:bg-[#FAF8F1] transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#24452D] flex items-center justify-center text-white text-xs font-bold">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      user.full_name[0]
                    )}
                  </div>
                  <span className="text-xs font-bold text-[#263328] hidden sm:inline max-w-[100px] truncate">
                    {user.full_name}
                  </span>
                  <ChevronDown size={13} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#F3E9D5] py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-[#263328] truncate">{user.full_name}</p>
                      <p className="text-[10px] text-[#65834C] font-semibold uppercase">{user.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF8F1]"
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-[#FAF8F1]"
                    >
                      {t('orders.title')}
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout()
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#24452D] hover:bg-[#F3E9D5]/60 transition-colors"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 rounded-xl bg-[#24452D] text-white text-xs font-bold hover:bg-[#31583b] transition-colors shadow-xs"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-white border border-[#F3E9D5] text-[#24452D]"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#F3E9D5] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive(link.to)
                    ? 'bg-[#24452D] text-white'
                    : 'text-[#263328] hover:bg-[#FAF8F1]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenCalculator()
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#65834C]"
            >
              <Calculator size={16} />
              <span>{t('nav.calculator')}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                onOpenBulk()
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#24452D]"
            >
              <Building2 size={16} />
              <span>{t('nav.bulk')}</span>
            </button>
          </div>

          {!user && (
            <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold text-[#24452D] border border-[#24452D] rounded-xl"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-center text-xs font-bold bg-[#24452D] text-white rounded-xl"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold text-gray-500">Academic & Incubation Partner:</span>
            <img
              src="/assets/cmrtc-logo.png"
              onError={(e) => { (e.target as HTMLImageElement).src = '/cmrtc logo.png' }}
              alt="CMR Technical Campus (CMRTC) Logo"
              className="h-7 w-auto object-contain"
            />
          </div>
        </div>
      )}
    </header>
  )
}
