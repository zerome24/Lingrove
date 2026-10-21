import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Camera, X, ChevronLeft, ChevronRight, Eye, Sparkles,
  ArrowRight, Users, Wrench, ShieldCheck, MapPin
} from 'lucide-react'

interface GalleryItem {
  id: string
  src: string
  title: {
    en: string
    te: string
    hi: string
  }
  caption: {
    en: string
    te: string
    hi: string
  }
  category: 'Machinery' | 'Community' | 'Training'
  location: string
  date: string
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'demo-1',
    src: '/gallery/bamboo-machine-demonstration.jpg',
    title: {
      en: 'Bamboo Machinery Demonstration',
      te: 'వెదురు యంత్రాల ప్రదర్శన',
      hi: 'बाँस मशीनरी प्रदर्शन'
    },
    caption: {
      en: 'Workshop engineers and rural artisans inspecting mature bamboo culms, cross-cutting circular saw alignment, and hydraulic radial splitters.',
      te: 'వర్క్‌షాప్‌లో ఇంజనీర్లు మరియు గ్రామీణ కళాకారులు వెదురు క్రాస్-కటింగ్ మరియు హైడ్రాలిక్ స్ప్లిటింగ్ యంత్రాలను పరిశీలిస్తున్నారు.',
      hi: 'कार्यशाला में इंजीनियर एवं ग्रामीण कारीगर बाँस कटिंग एवं हाइड्रोलिक स्प्लिटिंग मशीनरी का निरीक्षण करते हुए।'
    },
    category: 'Machinery',
    location: 'CMRTC Workshop',
    date: '2026'
  },
  {
    id: 'meeting-1',
    src: '/gallery/village-outreach-meeting.jpg',
    title: {
      en: 'Village Outreach Meeting',
      te: 'గ్రామ అవగాహన సదస్సు',
      hi: 'ग्रामीण जागरूकता बैठक'
    },
    caption: {
      en: 'Community orientation meeting in Lingala village hall, discussing bamboo craft training, income generation, and artisan registration.',
      te: 'లింగాల గ్రామ పంచాయతీ హాలులో వెదురు హస్తకళల శిక్షణ, స్వయం ఉపాధి మరియు మార్కెట్ అవకాశాలపై గ్రామస్తులతో నిర్వహించిన సదస్సు.',
      hi: 'लिंगाला ग्राम पंचायत भवन में बाँस शिल्प प्रशिक्षण और स्व-रोजगार अवसरों पर ग्रामीणों के साथ परिचर्चा।'
    },
    category: 'Community',
    location: 'Lingala Village, Telangana',
    date: '2026'
  },
  {
    id: 'gov-1',
    src: '/gallery/community-awareness-session.jpg',
    title: {
      en: 'Community Awareness & Governance',
      te: 'సమన్వయ అవగాహన సమావేశం',
      hi: 'सामुदायिक समन्वय बैठक'
    },
    caption: {
      en: 'Mandal Parishad representatives and rural development coordinators interacting with village elders to support the Lingrove bamboo initiative.',
      te: 'మండల పరిషత్ ప్రతినిధులు మరియు అధికారులు లింగ్రోవ్ వెదురు కార్యక్రమానికి తోడ్పాటు అందిస్తూ గ్రామస్తులతో సమావేశమయ్యారు.',
      hi: 'मंडल परिषद नेतृत्व एवं विकास अधिकारी लिंग्रोव बाँस पहल के प्रोत्साहन हेतु ग्रामवासियों से संवाद करते हुए।'
    },
    category: 'Community',
    location: 'Mandal Parishad Hall',
    date: '2026'
  },
  {
    id: 'training-1',
    src: '/gallery/hands-on-training-01.jpg',
    title: {
      en: 'Practical Machinery Training',
      te: 'ఆచరణాత్మక యంత్ర శిక్షణ',
      hi: 'व्यावहारिक मशीनरी प्रशिक्षण'
    },
    caption: {
      en: 'Artisan trainees and instructors gathered around the bamboo strip sizing and node removing machinery during hands-on technical sessions.',
      te: 'వెదురు స్ట్రిప్ సైజింగ్ మరియు స్లైసింగ్ యంత్రం వద్ద ప్రాక్టికల్ శిక్షణలో పాల్గొంటున్న మహిళా కళాకారులు మరియు శిక్షకులు.',
      hi: 'बाँस स्ट्रिप साइजिंग एवं स्लाइसिंग मशीन के पास व्यावहारिक तकनीकी प्रशिक्षण में भाग लेते महिला कारीगर एवं प्रशिक्षक।'
    },
    category: 'Training',
    location: 'CMRTC Bamboo Center',
    date: '2026'
  },
  {
    id: 'audience-1',
    src: '/gallery/bamboo-processing-workshop.jpg',
    title: {
      en: 'Hands-On Learning & Awareness',
      te: 'గ్రామీణ నైపుణ్యాభివృద్ధి సదస్సు',
      hi: 'ग्रामीण कौशल विकास सत्र'
    },
    caption: {
      en: 'Villagers and aspiring artisans listening attentively to machine demonstration protocols and craftsmanship safety procedures.',
      te: 'యంత్రాల భద్రతా నియమాలు మరియు వెదురు నైపుణ్యాల గురించి శ్రద్ధగా వింటున్న లింగాల గ్రామ యువకులు మరియు మహిళలు.',
      hi: 'मशीन सुरक्षा प्रोटोकॉल और बाँस शिल्प के बारे में ध्यानपूर्वक सुनते हुए लिंगाला के ग्रामीण एवं युवा।'
    },
    category: 'Community',
    location: 'Lingala Village',
    date: '2026'
  }
]

export const Gallery: React.FC = () => {
  const { t, i18n } = useTranslation()
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const langKey = (i18n.language in { en: 1, te: 1, hi: 1 } ? i18n.language : 'en') as 'en' | 'te' | 'hi'

  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category === selectedCategory)

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null))
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, filteredItems.length])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24452D]/10 text-[#24452D] text-xs font-bold">
          <Camera size={14} className="text-[#65834C]" />
          <span>Real Community Activities & Training</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#24452D]">
          {t('gallery.heading') || 'From Learning to Creating'}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {t('gallery.description') || 'Explore the people, machinery, training activities, and community efforts supporting bamboo craftsmanship and rural entrepreneurship.'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {['All', 'Machinery', 'Training', 'Community'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#24452D] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-[#F3E9D5] hover:bg-[#FAF8F1]'
            }`}
          >
            {cat === 'All' ? (t('gallery.all_photos') || 'All Activities') : cat}
          </button>
        ))}
      </div>

      {/* Responsive Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setLightboxIndex(index)}
            className="group bg-white rounded-3xl border border-[#F3E9D5] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Image Container with Natural Proportions */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
              <img
                src={item.src}
                alt={item.title[langKey]}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                  <Eye size={16} /> Click to expand image
                </span>
              </div>
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide">
                {item.category}
              </span>
            </div>

            {/* Caption & Metadata */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-2.5">
              <div>
                <h3 className="font-display font-bold text-base text-[#24452D] group-hover:text-[#65834C] transition-colors">
                  {item.title[langKey]}
                </h3>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  {item.caption[langKey]}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-[#65834C]" />
                  {item.location}
                </span>
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Bar */}
            <div className="p-4 bg-[#24452D] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-sm sm:text-base">
                  {filteredItems[lightboxIndex].title[langKey]}
                </h3>
                <p className="text-[11px] text-[#F3E9D5]/80">
                  {filteredItems[lightboxIndex].location} • {filteredItems[lightboxIndex].date}
                </p>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close Lightbox"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Image Display */}
            <div className="relative flex-1 bg-black/95 flex items-center justify-center overflow-hidden min-h-[360px] max-h-[65vh]">
              <img
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].title[langKey]}
                className="max-w-full max-h-[65vh] object-contain"
              />

              {/* Prev / Next controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : null))
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : null))
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Description bar */}
            <div className="p-4 sm:p-5 bg-[#FAF8F1] border-t border-[#F3E9D5] flex items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                {filteredItems[lightboxIndex].caption[langKey]}
              </p>
              <span className="text-xs font-bold text-gray-500 flex-shrink-0">
                {lightboxIndex + 1} / {filteredItems.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action: Learn & Shop */}
      <div className="bg-[#24452D] rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl">
            Want to learn these bamboo skills?
          </h3>
          <p className="text-xs sm:text-sm text-[#F3E9D5]/90 max-w-xl">
            Join the CMRTC Bamboo curriculum online or explore hand-crafted creations made by our certified rural artisans.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/learn"
            className="px-5 py-3 rounded-2xl bg-[#E8A64A] hover:bg-[#d4953c] text-[#24452D] font-bold text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <span>Start Learning</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to="/products"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
          >
            <span>Explore Products</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
export default Gallery
