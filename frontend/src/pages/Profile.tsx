import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User, ShieldCheck, Award, TrendingUp, Package, PlusCircle,
  Globe, Edit3, CheckCircle2, Bookmark, ExternalLink, Trash2
} from 'lucide-react'
import api from '../services/api'
import { Product, UserBadge, ArtisanProfile } from '../types'
import { useAuth } from '../context/AuthContext'

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user, refreshUser } = useAuth()

  const [artisanStats, setArtisanStats] = useState<any>(null)
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [badges, setBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  // Edit profile state
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [preferredLang, setPreferredLang] = useState(user?.preferred_language || 'en')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const [badgeRes] = await Promise.all([
          api.get('/learning/badges')
        ])
        setBadges(badgeRes.data)

        if (user?.role === 'artisan' || user?.role === 'admin') {
          try {
            const [statsRes, prodRes] = await Promise.all([
              api.get('/artisans/stats'),
              api.get('/products/my-products')
            ])
            setArtisanStats(statsRes.data)
            setMyProducts(prodRes.data)
          } catch {
            // Ignore if artisan profile not created yet
          }
        }
      } catch (err) {
        console.error('Failed to load profile details', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfileData()
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put('/auth/me', {
        full_name: fullName,
        phone,
        preferred_language: preferredLang
      })
      i18n.changeLanguage(preferredLang)
      await refreshUser()
      setEditing(false)
      alert('Profile updated successfully!')
    } catch {
      alert('Failed to update profile')
    }
  }

  const handleDeleteProduct = async (prodId: number) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return
    try {
      await api.delete(`/products/${prodId}`)
      setMyProducts((prev) => prev.filter((p) => p.id !== prodId))
    } catch {
      alert('Could not delete product')
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-xl text-gray-700">Please log in to view your dashboard</h2>
        <Link to="/login" className="inline-block px-5 py-2.5 bg-[#24452D] text-white rounded-xl text-xs font-bold">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#24452D] text-white flex items-center justify-center font-display font-bold text-2xl overflow-hidden flex-shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              user.full_name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-extrabold text-2xl text-[#24452D]">
                {user.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F1] border border-[#F3E9D5] text-[10px] font-extrabold text-[#65834C] uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-[#FAF8F1] flex items-center gap-1.5 transition-colors"
        >
          <Edit3 size={14} />
          <span>{editing ? 'Cancel' : t('profile.edit_profile')}</span>
        </button>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-[#FAF8F1] p-6 rounded-3xl border border-[#F3E9D5] space-y-4 max-w-xl animate-in fade-in"
        >
          <h3 className="font-display font-bold text-base text-[#24452D]">Update Account Details</h3>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Preferred Language</label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value as 'en' | 'te' | 'hi')}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
            >
              <option value="en">English</option>
              <option value="te">Telugu (తెలుగు)</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#24452D] text-white text-xs font-bold rounded-xl hover:bg-[#31583b]"
          >
            Save Changes
          </button>
        </form>
      )}

      {/* Artisan Dashboard Metrics (if artisan or admin) */}
      {artisanStats && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-[#24452D]">
                {t('profile.role_artisan')}
              </h2>
              <p className="text-xs text-gray-500">
                {artisanStats.village}, {artisanStats.region} • {artisanStats.craft_specialization}
              </p>
            </div>
            <Link
              to="/products"
              className="px-4 py-2 rounded-xl bg-[#24452D] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              <span>{t('profile.add_product_btn')}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#F3E9D5] shadow-xs">
              <span className="text-[11px] text-gray-500 font-bold uppercase block">{t('profile.total_earnings')}</span>
              <span className="font-display font-extrabold text-2xl text-[#24452D]">
                ₹{artisanStats.total_earnings.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#F3E9D5] shadow-xs">
              <span className="text-[11px] text-gray-500 font-bold uppercase block">{t('profile.active_listings')}</span>
              <span className="font-display font-extrabold text-2xl text-[#65834C]">
                {artisanStats.published_products}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#F3E9D5] shadow-xs">
              <span className="text-[11px] text-gray-500 font-bold uppercase block">Inventory Stock</span>
              <span className="font-display font-extrabold text-2xl text-[#E8A64A]">
                {artisanStats.total_stock} units
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#F3E9D5] shadow-xs">
              <span className="text-[11px] text-gray-500 font-bold uppercase block">{t('profile.incoming_orders')}</span>
              <span className="font-display font-extrabold text-2xl text-[#24452D]">
                {artisanStats.total_orders}
              </span>
            </div>
          </div>

          {/* Artisan Listed Products */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3E9D5] shadow-xs space-y-4">
            <h3 className="font-display font-bold text-lg text-[#24452D]">
              {t('profile.my_products')} ({myProducts.length})
            </h3>

            {myProducts.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No products listed under this profile yet.</p>
            ) : (
              <div className="space-y-3">
                {myProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5] text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-[#263328]">{p.title}</h4>
                      <p className="text-gray-500">₹{p.price} • {p.stock} in stock</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        to={`/products/${p.id}`}
                        className="text-[#65834C] hover:underline font-semibold"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Earned Badges Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Award size={22} className="text-[#E8A64A]" />
          <h2 className="font-display font-extrabold text-xl text-[#24452D]">
            {t('profile.earned_badges')} ({badges.length})
          </h2>
        </div>

        {badges.length === 0 ? (
          <p className="text-xs text-gray-500 italic">
            Complete learning modules in the Learning Center to earn certified craftsmanship badges!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5] flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8A64A]/20 text-[#24452D] flex items-center justify-center font-bold">
                  <ShieldCheck size={20} className="text-[#65834C]" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-xs text-[#263328]">{b.badge_name}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">{b.badge_description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
