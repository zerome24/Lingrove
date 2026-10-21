import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Star, CheckCircle2, MessageSquare, Heart, ShieldCheck,
  TrendingUp, Users, Leaf, Award
} from 'lucide-react'
import api from '../services/api'
import { Review } from '../types'
import { RatingStars } from '../components/RatingStars'
import { useAuth } from '../context/AuthContext'

export const Reviews: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)

  // Write review form
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [newType, setNewType] = useState('platform')
  const [submitting, setSubmitting] = useState(false)

  const fetchReviewsData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filterType !== 'all') params.review_type = filterType

      const [revRes, sumRes] = await Promise.all([
        api.get('/reviews', { params }),
        api.get('/reviews/summary')
      ])
      setReviews(revRes.data)
      setSummary(sumRes.data)
    } catch (err) {
      console.error('Failed to load reviews data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviewsData()
  }, [filterType])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to submit feedback.')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/reviews', {
        review_type: newType,
        rating: newRating,
        comment: newComment
      })
      setNewComment('')
      setShowForm(false)
      fetchReviewsData()
      alert('Thank you for sharing your experience with Lingrove!')
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#65834C]/20 text-[#24452D] text-xs font-bold">
          <Heart size={14} className="text-[#65834C]" />
          <span>Voices of Lingrove</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
          {t('reviews.title')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          {t('reviews.subtitle')}
        </p>
      </div>

      {/* Rating Breakdown & Overview Card */}
      {summary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 text-center md:text-left space-y-2 md:border-r md:border-gray-100 md:pr-8">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              {t('reviews.overall_rating')}
            </span>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="font-display font-extrabold text-5xl text-[#24452D]">
                {summary.average_rating}
              </span>
              <div>
                <RatingStars rating={summary.average_rating} size={18} />
                <span className="text-xs text-gray-500 mt-1 block">
                  Based on {summary.total_reviews} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Star Breakdown Bars */}
          <div className="md:col-span-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.rating_breakdown?.[star] || 0
              const percentage = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-right font-bold text-gray-600">{star} ★</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-[#E8A64A] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-400 text-right">{count}</span>
                </div>
              )
            })}
          </div>

          {/* Write Review CTA */}
          <div className="md:col-span-3 text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full py-3 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-xs shadow-bamboo transition-all"
            >
              {showForm ? 'Cancel Review' : t('reviews.write_review')}
            </button>
          </div>
        </div>
      )}

      {/* Review Submission Modal / Form */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-[#FAF8F1] p-6 sm:p-8 rounded-3xl border border-[#F3E9D5] space-y-4 max-w-2xl mx-auto animate-in fade-in"
        >
          <h3 className="font-display font-bold text-lg text-[#24452D]">Share Your Feedback</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Feedback Category</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white"
              >
                <option value="platform">Overall Platform Experience</option>
                <option value="learning">Bamboo Learning & Courses</option>
                <option value="product">Artisan Handcrafted Products</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Star Rating</label>
              <RatingStars
                rating={newRating}
                size={22}
                interactive
                onChange={(val) => setNewRating(val)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Your Detailed Experience</label>
            <textarea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What did you think of the craft quality, packaging, tutorial clarity, or village impact?"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 bg-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#24452D] text-white font-bold text-xs hover:bg-[#31583b]"
          >
            Submit Experience
          </button>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#F3E9D5] pb-3 text-xs">
        {['all', 'product', 'learning', 'platform'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl font-bold capitalize transition-colors ${
              filterType === type
                ? 'bg-[#24452D] text-white shadow-xs'
                : 'bg-white text-gray-600 hover:bg-[#FAF8F1]'
            }`}
          >
            {type === 'all' ? 'All Reviews' : `${type} Reviews`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-3xl p-6 border border-[#F3E9D5] shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF8F1] border border-[#F3E9D5] flex items-center justify-center font-bold text-xs text-[#24452D]">
                    {r.user_name ? r.user_name[0] : 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#263328]">{r.user_name || 'Community Member'}</h4>
                    <span className="text-[10px] text-gray-400 capitalize">{r.review_type} Review</span>
                  </div>
                </div>

                <RatingStars rating={r.rating} size={14} />
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                "{r.comment}"
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100">
              <span>{new Date(r.created_at).toLocaleDateString()}</span>
              {r.is_verified_purchase && (
                <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  <span>{t('reviews.verified_purchase')}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Artisan Transformation Stories */}
      <section className="bg-[#FAF8F1] rounded-3xl p-8 sm:p-12 border border-[#F3E9D5] space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#65834C] uppercase tracking-wider">
            Real Lives Empowered
          </span>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#24452D]">
            {t('reviews.stories_title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-[#F3E9D5] space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
                alt="Ramesh Kumar"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-display font-bold text-sm text-[#263328]">Ramesh Kumar</h4>
                <p className="text-xs text-[#65834C] font-semibold">Master Basket Weaver, Lingala</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "Before CMRTC introduced Lingrove, middle-traders took over 60% of our hard-earned craft margin. With direct ordering and verified product pricing, my family's monthly earnings doubled, allowing my daughter to pursue her higher education."
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#F3E9D5] space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
                alt="Laxmi Bai"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-display font-bold text-sm text-[#263328]">Laxmi Bai</h4>
                <p className="text-xs text-[#65834C] font-semibold">Bamboo Lighting & Planters</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">
              "The machine operation tutorials at CMRTC gave our self-help group the technical skills to slice bamboo uniformly down to 1.2mm. Today our woven lampshades decorate urban apartments across Hyderabad and Bengaluru."
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
