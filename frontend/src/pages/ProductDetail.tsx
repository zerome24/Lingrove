import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, ShoppingBag, ShieldCheck, Check, Star,
  Truck, RefreshCw, Leaf, User
} from 'lucide-react'
import api from '../services/api'
import { Product, Review } from '../types'
import { RatingStars } from '../components/RatingStars'
import { WhatsAppIcon } from '../components/WhatsAppIcon'
import { createWhatsAppChatUrl } from '../utils/whatsapp'
import { getMatchingBambooProductImage } from '../utils/productImages'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  // New review form
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const [prodRes, revRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews?product_id=${id}`)
      ])
      setProduct(prodRes.data)
      setReviews(revRes.data)
      if (prodRes.data.images && prodRes.data.images.length > 0) {
        setSelectedImage(prodRes.data.images[0].image_url)
      }
    } catch (err) {
      console.error('Error fetching product', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    const success = await addToCart(product.id, quantity, product)
    if (success) {
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    }
  }

  const handleDirectWhatsApp = () => {
    if (!product) return
    const unitPrice = product.discount_price && product.discount_price > 0 ? product.discount_price : product.price
    const details = {
      orderNumber: `LNG-WA-REQ-${Date.now().toString().slice(-6)}`,
      customerName: user?.full_name || 'Valued Customer',
      customerPhone: user?.phone,
      deliveryType: 'delivery' as const,
      items: [
        {
          title: product.title,
          sku: product.sku,
          quantity: quantity,
          unitPrice: unitPrice,
          totalPrice: unitPrice * quantity,
          customization: product.customization_options
        }
      ],
      subtotal: unitPrice * quantity,
      shippingFee: unitPrice * quantity >= 999 ? 0 : 99,
      taxAmount: Math.round(unitPrice * quantity * 0.05),
      totalAmount: unitPrice * quantity + (unitPrice * quantity >= 999 ? 0 : 99) + Math.round(unitPrice * quantity * 0.05),
      notes: ''
    }
    const url = createWhatsAppChatUrl(details)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    try {
      setSubmittingReview(true)
      await api.post('/reviews', {
        product_id: parseInt(id!),
        review_type: 'product',
        rating: reviewRating,
        comment: reviewComment
      })
      setReviewComment('')
      fetchProduct()
      alert('Thank you! Your review has been submitted.')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center font-bold text-gray-500 text-sm">
        Loading product details...
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-xl text-gray-700">Product Not Found</h2>
        <Link to="/products" className="inline-block px-4 py-2 bg-[#24452D] text-white rounded-xl text-xs font-bold">
          Back to Marketplace
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#24452D] transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to All Products</span>
      </Link>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Gallery (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {(() => {
            const fallbackImg = getMatchingBambooProductImage(product.title, product.category?.slug)
            return (
              <>
                <div className="aspect-4/3 rounded-3xl overflow-hidden bg-[#FAF8F1] border border-[#F3E9D5] shadow-xs">
                  <img
                    src={selectedImage || fallbackImg}
                    alt={product.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-3">
                    {product.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.image_url)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all bg-[#FAF8F1] ${
                          selectedImage === img.image_url ? 'border-[#24452D] scale-105' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt=""
                          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg }}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>

        {/* Right Details (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.category && (
                <span className="text-xs font-bold uppercase tracking-wider text-[#65834C]">
                  {t(`categories.${product.category.slug}`) || product.category.name}
                </span>
              )}
              {product.is_demo && (
                <span className="text-[10px] font-bold bg-[#24452D] text-white px-2 py-0.5 rounded-full">
                  CMRTC DEMO
                </span>
              )}
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
              {product.title}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mt-3">
              <RatingStars rating={product.rating} size={16} />
              <span className="font-bold text-xs text-gray-800">{product.rating}</span>
              <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5] flex flex-wrap items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-3">
              {product.discount_price && product.discount_price > 0 ? (
                <>
                  <span className="font-display font-extrabold text-3xl text-[#24452D]">
                    ₹{product.discount_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-400 line-through font-semibold">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save ₹{(product.price - product.discount_price).toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="font-display font-extrabold text-3xl text-[#24452D]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {product.sku && (
                <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-xl border border-[#F3E9D5] text-gray-600 font-bold">
                  SKU: {product.sku}
                </span>
              )}
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl ${
                product.stock > 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-display font-bold text-sm text-[#263328] mb-1">About This Product</h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Extended Specifications Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-gray-100">
            <div>
              <span className="text-gray-500 font-semibold block">{t('products.materials')}:</span>
              <span className="font-bold text-gray-800">{product.materials}</span>
            </div>
            {product.dimensions && (
              <div>
                <span className="text-gray-500 font-semibold block">{t('products.dimensions')}:</span>
                <span className="font-bold text-gray-800">{product.dimensions}</span>
              </div>
            )}
            {product.weight && (
              <div>
                <span className="text-gray-500 font-semibold block">Weight:</span>
                <span className="font-bold text-gray-800">{product.weight}</span>
              </div>
            )}
            {product.estimated_prep_time && (
              <div>
                <span className="text-gray-500 font-semibold block">Preparation Time:</span>
                <span className="font-bold text-gray-800">{product.estimated_prep_time}</span>
              </div>
            )}
            {product.delivery_pickup_info && (
              <div className="sm:col-span-2">
                <span className="text-gray-500 font-semibold block">Fulfillment / Pickup:</span>
                <span className="font-bold text-emerald-800">{product.delivery_pickup_info}</span>
              </div>
            )}
            {product.customization_options && (
              <div className="sm:col-span-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                <span className="font-bold block mb-0.5">Customization Available:</span>
                <span className="text-[11px] leading-relaxed">{product.customization_options}</span>
              </div>
            )}
          </div>

          {/* Artisan Profile Card */}
          {product.artisan && (
            <div className="p-4 rounded-2xl bg-white border border-[#F3E9D5] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#24452D] text-white flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0">
                {product.artisan.avatar_url ? (
                  <img src={product.artisan.avatar_url} alt={product.artisan.artisan_name} className="w-full h-full object-cover" />
                ) : (
                  product.artisan.artisan_name[0]
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-display font-bold text-sm text-[#24452D]">
                    {product.artisan.artisan_name}
                  </h4>
                  <ShieldCheck size={14} className="text-[#65834C]" />
                </div>
                <p className="text-xs text-gray-600">{product.artisan.village}, {product.artisan.region}</p>
                <p className="text-[11px] text-[#65834C] font-semibold">{product.artisan.craft_specialization}</p>
              </div>
            </div>
          )}

          {/* Quantity, Add to Cart & Direct WhatsApp Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-2xl p-1 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-gray-600 hover:bg-[#FAF8F1]"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-gray-600 hover:bg-[#FAF8F1]"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-bamboo transition-all ${
                  justAdded
                    ? 'bg-[#65834C] text-white'
                    : product.stock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#24452D] hover:bg-[#31583b] text-white'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>{t('products.add_to_cart')}</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleDirectWhatsApp}
              disabled={product.stock === 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <WhatsAppIcon className="w-4 h-4 fill-white" />
              <span>Order this item directly via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="pt-8 border-t border-[#F3E9D5] space-y-8">
        <h2 className="font-display font-extrabold text-2xl text-[#24452D]">
          Product Reviews & Feedback ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No reviews yet for this product. Be the first to share your thoughts!</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="p-4 bg-white rounded-2xl border border-[#F3E9D5] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF8F1] border border-[#F3E9D5] flex items-center justify-center text-xs font-bold text-[#24452D]">
                        {r.user_name ? r.user_name[0] : 'U'}
                      </div>
                      <span className="text-xs font-bold text-gray-800">{r.user_name}</span>
                      {r.is_verified_purchase && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={10} /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <RatingStars rating={r.rating} size={13} />
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write Review Card */}
          <div className="lg:col-span-5 bg-[#FAF8F1] p-6 rounded-3xl border border-[#F3E9D5]">
            <h3 className="font-display font-bold text-base text-[#24452D] mb-1">
              Write a Review
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Your feedback directly supports rural artisan craftsmanship.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Rating</label>
                <RatingStars
                  rating={reviewRating}
                  size={22}
                  interactive
                  onChange={(val) => setReviewRating(val)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Comments</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about texture, bamboo weave, finish, or utility..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#65834C]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 rounded-xl bg-[#24452D] text-white font-bold text-xs hover:bg-[#31583b] transition-colors"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
