import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight, BookOpen, ShoppingBag, TrendingUp, ShieldCheck,
  Leaf, Users, Award, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react'
import api from '../services/api'
import { Product, LearningModule } from '../types'
import { ProductCard } from '../components/ProductCard'

interface HomeProps {
  onOpenCalculator: () => void
}

export const Home: React.FC<HomeProps> = ({ onOpenCalculator }) => {
  const { t } = useTranslation()

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [learningModules, setLearningModules] = useState<LearningModule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, learnRes] = await Promise.all([
          api.get('/products'),
          api.get('/learning/modules')
        ])
        setFeaturedProducts(prodRes.data.slice(0, 4))
        setLearningModules(learnRes.data.slice(0, 3))
      } catch (err) {
        console.error('Error fetching home data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeData()
  }, [])

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F3E9D5]/60 via-[#FAF8F1] to-[#FAF8F1] pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24452D]/10 border border-[#24452D]/20 text-[#24452D] text-xs font-bold tracking-wide">
                <Leaf size={14} className="text-[#65834C]" />
                <span>{t('hero.badge')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#24452D] tracking-tight leading-[1.12]">
                {t('hero.title')}
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t('hero.subtitle')}
              </p>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/learn"
                  className="px-6 py-3.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white font-bold text-sm flex items-center gap-2 shadow-bamboo hover:scale-102 active:scale-98 transition-all"
                >
                  <span>{t('hero.learn_btn')}</span>
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/products"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-[#F3E9D5]/50 text-[#24452D] border-2 border-[#24452D]/20 font-bold text-sm flex items-center gap-2 shadow-xs transition-all"
                >
                  <span>{t('hero.shop_btn')}</span>
                  <ShoppingBag size={16} />
                </Link>

                <button
                  onClick={onOpenCalculator}
                  className="px-5 py-3.5 rounded-2xl bg-[#F3E9D5] hover:bg-[#e5d7bd] text-[#24452D] font-bold text-sm transition-all cursor-pointer"
                >
                  {t('hero.calc_btn')}
                </button>
              </div>

              {/* Impact stats pill */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#F3E9D5] text-center lg:text-left">
                <div>
                  <span className="font-display font-extrabold text-2xl text-[#24452D] block">120+</span>
                  <span className="text-xs text-gray-600 font-medium">{t('hero.stats_artisans')}</span>
                </div>
                <div>
                  <span className="font-display font-extrabold text-2xl text-[#65834C] block">450+</span>
                  <span className="text-xs text-gray-600 font-medium">{t('hero.stats_products')}</span>
                </div>
                <div>
                  <span className="font-display font-extrabold text-2xl text-[#E8A64A] block">2,400+</span>
                  <span className="text-xs text-gray-600 font-medium">{t('hero.stats_learners')}</span>
                </div>
                <div>
                  <span className="font-display font-extrabold text-2xl text-[#24452D] block">100%</span>
                  <span className="text-xs text-gray-600 font-medium">{t('hero.stats_sustainability')}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Image */}
                <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80"
                    alt="Artisan crafting bamboo basket at CMRTC"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating Artisan Card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-[#F3E9D5] flex items-center gap-3 max-w-xs animate-in slide-in-from-bottom-4">
                  <div className="w-12 h-12 rounded-xl bg-[#24452D] text-white flex items-center justify-center font-extrabold text-base flex-shrink-0">
                    CMRTC
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-[#263328]">Lingala Bamboo Center</h4>
                    <p className="text-[11px] text-[#65834C] font-medium">Sustainable Rural Enterprise</p>
                  </div>
                </div>

                {/* Floating Eco Pip */}
                <div className="absolute -top-4 -right-4 bg-[#E8A64A] text-[#24452D] p-3 rounded-2xl shadow-lg font-bold text-xs flex items-center gap-1.5">
                  <Sparkles size={16} />
                  <span>Fair Trade Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Learn -> Create -> Sell -> Grow) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
            {t('how_it_works.title')}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t('how_it_works.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-[#F3E9D5] shadow-sm hover:shadow-bamboo transition-all relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F1] text-[#24452D] border border-[#F3E9D5] flex items-center justify-center mb-4">
              <BookOpen size={22} className="text-[#65834C]" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#24452D] mb-2">
              {t('how_it_works.step1_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('how_it_works.step1_desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-[#F3E9D5] shadow-sm hover:shadow-bamboo transition-all relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F1] text-[#24452D] border border-[#F3E9D5] flex items-center justify-center mb-4">
              <Leaf size={22} className="text-[#65834C]" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#24452D] mb-2">
              {t('how_it_works.step2_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('how_it_works.step2_desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#F3E9D5] shadow-sm hover:shadow-bamboo transition-all relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F1] text-[#24452D] border border-[#F3E9D5] flex items-center justify-center mb-4">
              <ShoppingBag size={22} className="text-[#E8A64A]" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#24452D] mb-2">
              {t('how_it_works.step3_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('how_it_works.step3_desc')}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-[#F3E9D5] shadow-sm hover:shadow-bamboo transition-all relative">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F1] text-[#24452D] border border-[#F3E9D5] flex items-center justify-center mb-4">
              <TrendingUp size={22} className="text-[#24452D]" />
            </div>
            <h3 className="font-display font-bold text-lg text-[#24452D] mb-2">
              {t('how_it_works.step4_title')}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('how_it_works.step4_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED BAMBOO PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#65834C] uppercase tracking-wider mb-1">
              Handmade In Lingala Village
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
              Featured Bamboo Products
            </h2>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs font-bold text-[#24452D] hover:text-[#65834C] transition-colors"
          >
            <span>View All Products</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 4. ABOUT LINGROVE & CMRTC MISSION */}
      <section className="bg-[#24452D] text-white py-16 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[#E8A64A] text-xs font-extrabold uppercase tracking-widest">
                Our Foundation
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#FAF8F1]">
                {t('about.title')}
              </h2>
              <p className="text-sm text-[#F3E9D5]/90 leading-relaxed">
                {t('about.p1')}
              </p>
              <p className="text-sm text-[#F3E9D5]/80 leading-relaxed">
                {t('about.p2')}
              </p>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  to="/reviews"
                  className="px-5 py-2.5 rounded-xl bg-[#FAF8F1] text-[#24452D] font-bold text-xs hover:bg-[#F3E9D5] transition-colors"
                >
                  Read Community Stories
                </Link>
                <Link
                  to="/learn"
                  className="px-5 py-2.5 rounded-xl border border-white/30 text-white font-bold text-xs hover:bg-white/10 transition-colors"
                >
                  Explore Curriculum
                </Link>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <ShieldCheck size={20} className="text-[#E8A64A] mb-2" />
                <h4 className="font-display font-bold text-sm mb-1">{t('about.mission_1_title')}</h4>
                <p className="text-xs text-[#FAF8F1]/80">{t('about.mission_1_desc')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <Award size={20} className="text-[#E8A64A] mb-2" />
                <h4 className="font-display font-bold text-sm mb-1">{t('about.mission_2_title')}</h4>
                <p className="text-xs text-[#FAF8F1]/80">{t('about.mission_2_desc')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <Leaf size={20} className="text-[#E8A64A] mb-2" />
                <h4 className="font-display font-bold text-sm mb-1">{t('about.mission_3_title')}</h4>
                <p className="text-xs text-[#FAF8F1]/80">{t('about.mission_3_desc')}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <Users size={20} className="text-[#E8A64A] mb-2" />
                <h4 className="font-display font-bold text-sm mb-1">{t('about.mission_4_title')}</h4>
                <p className="text-xs text-[#FAF8F1]/80">{t('about.mission_4_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. POPULAR LEARNING MODULES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#65834C] uppercase tracking-wider mb-1">
              CMRTC Curriculum
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
              Popular Learning Modules
            </h2>
          </div>
          <Link
            to="/learn"
            className="flex items-center gap-1.5 text-xs font-bold text-[#24452D] hover:text-[#65834C] transition-colors"
          >
            <span>Browse All Tutorials</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningModules.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl overflow-hidden border border-[#F3E9D5] shadow-sm hover:shadow-bamboo transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-16/9 bg-[#FAF8F1] overflow-hidden relative">
                  <img
                    src={m.thumbnail_url || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80'}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#24452D]/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {m.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 text-[#24452D] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {m.estimated_duration}
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[11px] font-bold text-[#65834C] uppercase tracking-wider">
                    {m.difficulty} Level
                  </span>
                  <h3 className="font-display font-bold text-lg text-[#263328] mt-1 line-clamp-1">
                    {m.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                    {m.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to="/learn"
                  className="w-full py-2.5 rounded-xl bg-[#FAF8F1] hover:bg-[#F3E9D5] text-[#24452D] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#F3E9D5]"
                >
                  <span>Start Tutorial</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. REAL ACTIVITIES & WORKSHOP GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#65834C] uppercase tracking-wider mb-1">
              Field Activities & Outreach
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#24452D]">
              From Learning to Creating
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Authentic moments from our machinery demonstrations, village awareness meetings, and hands-on artisan training sessions in Lingala.
            </p>
          </div>
          <Link
            to="/gallery"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#24452D]/20 text-xs font-bold text-[#24452D] hover:bg-[#F3E9D5]/50 transition-colors shadow-2xs"
          >
            <span>View All Gallery Photos</span>
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="group bg-white rounded-2xl overflow-hidden border border-[#F3E9D5] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
              <img
                src="/gallery/bamboo-machine-demonstration.jpg"
                alt="Bamboo Machinery Demonstration"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                Machinery
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-xs text-[#24452D] line-clamp-1">
                  Machinery Demonstration
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                  Testing bamboo cross-cutting saw and hydraulic radial splitters in the workshop.
                </p>
              </div>
              <span className="text-[10px] text-[#65834C] font-semibold mt-2 block">CMRTC Workshop</span>
            </div>
          </div>

          <div className="group bg-white rounded-2xl overflow-hidden border border-[#F3E9D5] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
              <img
                src="/gallery/village-outreach-meeting.jpg"
                alt="Village Outreach Meeting"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                Community
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-xs text-[#24452D] line-clamp-1">
                  Village Outreach Session
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                  Artisan orientation on sustainable bamboo crafts and direct digital selling.
                </p>
              </div>
              <span className="text-[10px] text-[#65834C] font-semibold mt-2 block">Lingala Village</span>
            </div>
          </div>

          <div className="group bg-white rounded-2xl overflow-hidden border border-[#F3E9D5] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
              <img
                src="/gallery/hands-on-training-01.jpg"
                alt="Practical Machinery Training"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                Training
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-xs text-[#24452D] line-clamp-1">
                  Hands-On Equipment Training
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                  Trainees mastering strip sizing and uniform sliver processing machinery.
                </p>
              </div>
              <span className="text-[10px] text-[#65834C] font-semibold mt-2 block">CMRTC Incubation</span>
            </div>
          </div>

          <div className="group bg-white rounded-2xl overflow-hidden border border-[#F3E9D5] shadow-xs hover:shadow-md transition-all flex flex-col">
            <div className="aspect-4/3 overflow-hidden bg-gray-100 relative">
              <img
                src="/gallery/community-awareness-session.jpg"
                alt="Community Awareness Session"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                Governance
              </span>
            </div>
            <div className="p-3.5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-xs text-[#24452D] line-clamp-1">
                  Mandal Parishad Coordination
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                  Community leaders and officers aligning to foster rural bamboo entrepreneurship.
                </p>
              </div>
              <span className="text-[10px] text-[#65834C] font-semibold mt-2 block">Lingala Mandal</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SUSTAINABILITY COMMITMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF8F1] rounded-3xl p-8 sm:p-12 border border-[#F3E9D5] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-[#65834C] uppercase tracking-wider">
              100% Eco-Positive Impact
            </span>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#24452D]">
              Bamboo: The Ultimate Eco-Material
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Bamboo matures in just 3 years without pesticides and absorbs 35% more carbon dioxide than hardwood trees. Every Lingrove purchase directly helps villagers replace single-use plastic goods with completely biodegradable everyday utensils and furniture.
            </p>
          </div>

          <div className="flex-shrink-0 flex gap-3">
            <Link
              to="/products"
              className="px-6 py-3.5 rounded-2xl bg-[#24452D] text-white font-bold text-xs shadow-sm hover:bg-[#31583b] transition-all"
            >
              Shop Sustainable Crafts
            </Link>
            <Link
              to="/register?role=artisan"
              className="px-6 py-3.5 rounded-2xl bg-white border border-[#24452D] text-[#24452D] font-bold text-xs hover:bg-[#F3E9D5]/40 transition-all"
            >
              Join as Artisan
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
