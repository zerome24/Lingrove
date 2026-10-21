import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search, SlidersHorizontal, PlusCircle, ArrowUpDown,
  Filter, X, ShoppingBag, ShieldCheck
} from 'lucide-react'
import api from '../services/api'
import { Product, Category } from '../types'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'

export const Products: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    searchParams.get('category') ? parseInt(searchParams.get('category')!) : null
  )
  const [sortBy, setSortBy] = useState('newest')
  const [maxPrice, setMaxPrice] = useState<number>(5000)

  // Create Product Modal for Artisans
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProductData, setNewProductData] = useState({
    title: '',
    category_id: 1,
    description: '',
    price: 499,
    stock: 15,
    dimensions: '25cm x 25cm x 15cm',
    materials: '100% Seasoned Lingala Bamboo',
    image_url: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80',
    is_published: true,
    is_draft: false
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = { sort_by: sortBy }
      if (selectedCategoryId) params.category_id = selectedCategoryId
      if (search.trim()) params.search = search.trim()
      if (maxPrice < 5000) params.max_price = maxPrice

      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params }),
        api.get('/categories')
      ])
      setProducts(prodRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error('Error fetching marketplace products', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [selectedCategoryId, sortBy, maxPrice])

  // Resolve slug or numeric ID from URL searchParams
  useEffect(() => {
    const catParam = searchParams.get('category')
    if (catParam) {
      if (!isNaN(Number(catParam))) {
        setSelectedCategoryId(Number(catParam))
      } else if (categories.length > 0) {
        const found = categories.find((c) => c.slug === catParam)
        if (found) setSelectedCategoryId(found.id)
      }
    }
  }, [searchParams, categories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts()
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploadingImage(true)
      const res = await api.post('/products/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setNewProductData((prev) => ({ ...prev, image_url: res.data.image_url }))
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Image upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/products', {
        title: newProductData.title,
        description: newProductData.description,
        price: newProductData.price,
        stock: newProductData.stock,
        category_id: newProductData.category_id,
        dimensions: newProductData.dimensions,
        materials: newProductData.materials,
        is_published: newProductData.is_published,
        is_draft: newProductData.is_draft,
        image_urls: [newProductData.image_url]
      })
      setShowAddModal(false)
      fetchProducts()
      alert('Bamboo product listed successfully!')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to list product')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#65834C]/20 text-[#24452D] text-xs font-bold mb-2">
            <ShieldCheck size={14} className="text-[#65834C]" />
            <span>CMRTC Fair Trade Marketplace</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
            {t('products.title')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t('products.subtitle')}
          </p>
        </div>

        {/* Sell Your Products Button */}
        <div>
          {user ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-bamboo transition-all cursor-pointer"
            >
              <PlusCircle size={18} />
              <span>{t('products.sell_cta')}</span>
            </button>
          ) : (
            <Link
              to="/register?role=artisan"
              className="px-5 py-3 rounded-2xl bg-[#E8A64A] hover:bg-[#cf8b2b] text-[#24452D] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle size={18} />
              <span>{t('products.sell_cta')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#F3E9D5] shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="md:col-span-6 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('products.search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-xs sm:text-sm"
            />
          </form>

          {/* Sort Dropdown */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">{t('products.sort_by')}:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-semibold text-xs focus:outline-none"
            >
              <option value="newest">{t('products.sort_newest')}</option>
              <option value="price_asc">{t('products.sort_price_low')}</option>
              <option value="price_desc">{t('products.sort_price_high')}</option>
              <option value="rating">{t('products.sort_rating')}</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Up to ₹{maxPrice}:</span>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-[#65834C]"
            />
          </div>
        </div>

        {/* Quick Filter: Finished vs Raw materials */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-[#24452D] text-white shadow-xs'
                : 'bg-[#FAF8F1] text-gray-700 hover:bg-[#F3E9D5]'
            }`}
          >
            {t('products.all_categories')}
          </button>
          {categories.map((c) => {
            const translatedName = t(`categories.${c.slug}`) || c.name
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedCategoryId === c.id
                    ? 'bg-[#24452D] text-white shadow-xs'
                    : 'bg-[#FAF8F1] text-gray-700 hover:bg-[#F3E9D5]'
                }`}
              >
                {translatedName}
              </button>
            )
          })}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-semibold text-gray-500">
          Loading authentic bamboo products...
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[#F3E9D5] p-8 space-y-3">
          <ShoppingBag size={48} className="text-gray-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-gray-700">No products found</h3>
          <p className="text-xs text-gray-500">Try adjusting your filters or search keywords.</p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedCategoryId(null)
              setMaxPrice(5000)
            }}
            className="px-4 py-2 bg-[#FAF8F1] text-[#24452D] text-xs font-bold rounded-xl border border-[#F3E9D5]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Artisan Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-2xl border border-[#F3E9D5] relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="font-display font-extrabold text-2xl text-[#24452D] mb-1">
              List Your Bamboo Product
            </h2>
            <p className="text-xs text-gray-600 mb-6">
              Empowering rural Lingala artisans with direct digital commerce.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProductData.title}
                  onChange={(e) => setNewProductData({ ...newProductData, title: e.target.value })}
                  placeholder="e.g. Lingala Bamboo Fruit Basket"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#65834C]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newProductData.category_id}
                    onChange={(e) => setNewProductData({ ...newProductData, category_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    min="1"
                    value={newProductData.price}
                    onChange={(e) => setNewProductData({ ...newProductData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Inventory Stock</label>
                  <input
                    type="number"
                    min="1"
                    value={newProductData.stock}
                    onChange={(e) => setNewProductData({ ...newProductData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={newProductData.dimensions}
                    onChange={(e) => setNewProductData({ ...newProductData, dimensions: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProductData.description}
                  onChange={(e) => setNewProductData({ ...newProductData, description: e.target.value })}
                  placeholder="Explain your crafting process, bamboo curing, and usage..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#FAF8F1] file:text-[#24452D] hover:file:bg-[#F3E9D5]"
                />
                {uploadingImage && <p className="text-[11px] text-gray-400 mt-1">Uploading image...</p>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-[#24452D] text-white font-bold text-xs hover:bg-[#31583b]"
                >
                  Publish Bamboo Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
