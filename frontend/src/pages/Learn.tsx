import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search, BookOpen, Clock, Award, CheckCircle, Bookmark,
  AlertTriangle, ShieldAlert, Cpu, ExternalLink,
  ChevronDown, ChevronUp, Play, Video, Sparkles
} from 'lucide-react'
import api from '../services/api'
import { LearningModule, MachineDirectoryItem } from '../types'
import { useAuth } from '../context/AuthContext'

interface VideoItem {
  video_id: string
  title: string
  channel_title: string
  description: string
  thumbnail_url: string
  watch_url: string
  embed_url: string
  is_live_api?: boolean
}

// Helper to safely extract YouTube embed URL from any valid format
const extractYouTubeEmbedUrl = (url?: string): string | null => {
  if (!url || typeof url !== 'string') return null
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  const match = url.match(regex)
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0`
  }
  return null
}

export const Learn: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()

  const [modules, setModules] = useState<LearningModule[]>([])
  const [machines, setMachines] = useState<MachineDirectoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // Active module & videos
  const [activeModule, setActiveModule] = useState<LearningModule | null>(null)
  const [moduleVideos, setModuleVideos] = useState<VideoItem[]>([])
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [expandedMachineId, setExpandedMachineId] = useState<number | null>(null)

  const categories = [
    'all',
    'Bamboo Cutting',
    'Bamboo Slicing',
    'Bamboo Splitting',
    'Basket Making',
    'Furniture Making',
    'Finishing Techniques',
    'Machine Maintenance'
  ]

  const fetchModules = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedCategory !== 'all') params.category = selectedCategory
      if (selectedDifficulty !== 'all') params.difficulty = selectedDifficulty
      if (search.trim()) params.search = search.trim()

      const [modRes, machRes] = await Promise.all([
        api.get('/learning/modules', { params }),
        api.get('/machines')
      ])
      setModules(modRes.data)
      setMachines(machRes.data)
      if (!activeModule && modRes.data.length > 0) {
        setActiveModule(modRes.data[0])
      }
    } catch (err) {
      console.error('Failed to load learning data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [selectedCategory, selectedDifficulty])

  // Fetch relevant videos whenever active module changes
  useEffect(() => {
    if (!activeModule) return

    const fetchVideosForModule = async () => {
      setLoadingVideos(true)
      try {
        const res = await api.get('/learning/videos', {
          params: {
            category: activeModule.category,
            module_title: activeModule.title,
            language: i18n.language
          }
        })

        const videos: VideoItem[] = res.data
        setModuleVideos(videos)

        // If activeModule already has its own verified video, use it, or pick first from discovery
        const directEmbed = extractYouTubeEmbedUrl(activeModule.video_url)
        if (directEmbed) {
          const match = activeModule.video_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
          const vidId = match ? match[1] : ''
          setActiveVideo({
            video_id: vidId,
            title: activeModule.title,
            channel_title: 'CMRTC Bamboo Program',
            description: activeModule.summary,
            thumbnail_url: activeModule.thumbnail_url || '',
            watch_url: `https://www.youtube.com/watch?v=${vidId}`,
            embed_url: directEmbed
          })
        } else if (videos.length > 0) {
          setActiveVideo(videos[0])
        } else {
          setActiveVideo(null)
        }
      } catch (err) {
        console.warn('Could not fetch module videos', err)
      } finally {
        setLoadingVideos(false)
      }
    }

    fetchVideosForModule()
  }, [activeModule?.id, i18n.language])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchModules()
  }

  const handleToggleComplete = async (mod: LearningModule) => {
    if (!user) {
      alert('Please login to track your learning progress and earn certificates!')
      return
    }

    const currentCompleted = mod.user_progress?.is_completed || false
    try {
      const res = await api.post(`/learning/modules/${mod.id}/progress`, {
        is_completed: !currentCompleted,
        progress_percentage: !currentCompleted ? 100 : 0
      })

      setModules((prev) =>
        prev.map((m) =>
          m.id === mod.id
            ? { ...m, user_progress: res.data }
            : m
        )
      )
      if (activeModule?.id === mod.id) {
        setActiveModule((prev) => prev ? { ...prev, user_progress: res.data } : null)
      }
    } catch (err) {
      console.error('Failed to update progress', err)
    }
  }

  const handleToggleBookmark = async (mod: LearningModule) => {
    if (!user) {
      alert('Please login to bookmark lessons!')
      return
    }
    const currentBookmarked = mod.user_progress?.bookmarked || false
    try {
      const res = await api.post(`/learning/modules/${mod.id}/progress`, {
        bookmarked: !currentBookmarked
      })
      setModules((prev) =>
        prev.map((m) =>
          m.id === mod.id
            ? { ...m, user_progress: res.data }
            : m
        )
      )
      if (activeModule?.id === mod.id) {
        setActiveModule((prev) => prev ? { ...prev, user_progress: res.data } : null)
      }
    } catch (err) {
      console.error('Failed to bookmark', err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24452D]/10 text-[#24452D] text-xs font-bold">
          <BookOpen size={14} className="text-[#65834C]" />
          <span>CMRTC Bamboo Craft Curriculum</span>
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-[#24452D]">
          {t('learn.title')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('learn.subtitle')}
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 flex items-start gap-4 shadow-xs">
        <ShieldAlert size={28} className="text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-display font-bold text-amber-950 text-sm sm:text-base">
            Essential Workshop Safety Advisory
          </h4>
          <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
            Bamboo processing involves sharp rotary saw blades, hydraulic rams, and micro-splinters. Never operate slicing or cutting machinery without certified eye protection, snug-fitting protective gear, and trained CMRTC technician supervision.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#F3E9D5] shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('learn.search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-xs sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] text-white text-xs font-bold transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Category Pills & Difficulty Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5 overflow-x-auto text-xs">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  selectedCategory === c
                    ? 'bg-[#24452D] text-white'
                    : 'bg-[#FAF8F1] text-gray-700 hover:bg-[#F3E9D5]'
                }`}
              >
                {c === 'all' ? t('products.all_categories') : c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-500">Level:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-medium text-xs focus:outline-none"
            >
              <option value="all">{t('learn.all_difficulties')}</option>
              <option value="beginner">{t('learn.beginner')}</option>
              <option value="intermediate">{t('learn.intermediate')}</option>
              <option value="advanced">{t('learn.advanced')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Learning Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Module Listing Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-display font-bold text-lg text-[#24452D]">
            Available Modules ({modules.length})
          </h3>

          <div className="space-y-3.5 max-h-[900px] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#F3E9D5] space-y-2">
                <div className="w-6 h-6 border-2 border-[#24452D] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Loading bamboo modules...</p>
              </div>
            ) : modules.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#F3E9D5]">
                <p className="text-xs text-gray-500">No learning modules found matching your filter criteria.</p>
              </div>
            ) : (
              modules.map((m) => {
              const isSelected = activeModule?.id === m.id
              const isCompleted = m.user_progress?.is_completed || false

              return (
                <div
                  key={m.id}
                  onClick={() => setActiveModule(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#24452D] shadow-md ring-2 ring-[#24452D]/20'
                      : 'bg-white/80 border-[#F3E9D5] hover:bg-white hover:border-[#65834C]'
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={m.thumbnail_url || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=300&q=80'}
                      alt={m.title}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#65834C]">
                          {m.category}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            <CheckCircle size={11} />
                            Completed
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-sm text-[#263328] line-clamp-1">
                        {m.title}
                      </h4>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {m.estimated_duration}
                        </span>
                        <span className="capitalize px-2 py-0.5 rounded-md bg-[#FAF8F1] border border-gray-100 text-[10px]">
                          {m.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          </div>
        </div>

        {/* Right Column: Active Module Detail & Video Viewer (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#F3E9D5] shadow-sm space-y-6 sticky top-28">
          {activeModule ? (
            <>
              {/* Media / Video Player */}
              <div className="aspect-16/9 bg-black rounded-2xl overflow-hidden relative group shadow-md">
                {activeVideo && activeVideo.embed_url ? (
                  <iframe
                    key={activeVideo.video_id}
                    src={activeVideo.embed_url}
                    title={activeVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full relative flex items-center justify-center">
                    <img
                      src={activeModule.thumbnail_url || 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80'}
                      alt={activeModule.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-6 text-center">
                      <Video size={40} className="text-[#E8A64A] mb-2" />
                      <h4 className="font-display font-bold text-base">Educational Video Demonstration</h4>
                      <p className="text-xs text-gray-300 mt-1 max-w-sm">
                        Curated bamboo training demonstration stream for {activeModule.title}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube Video Selector & External Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#FAF8F1] rounded-2xl border border-[#F3E9D5]">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-red-600" />
                  <span className="text-xs font-bold text-[#24452D]">
                    {activeVideo?.title || activeModule.title}
                  </span>
                </div>

                {activeVideo?.watch_url && (
                  <a
                    href={activeVideo.watch_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#24452D] hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              {/* Related Module Videos List */}
              {moduleVideos.length > 1 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Module Video Demonstrations ({moduleVideos.length})
                    </h5>
                    {loadingVideos && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Sparkles size={11} className="animate-spin text-[#65834C]" />
                        Updating videos...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {moduleVideos.map((v) => (
                      <button
                        key={v.video_id}
                        onClick={() => setActiveVideo(v)}
                        className={`p-2.5 rounded-xl border text-left flex gap-2.5 items-center transition-all cursor-pointer ${
                          activeVideo?.video_id === v.video_id
                            ? 'bg-emerald-50 border-[#24452D] ring-1 ring-[#24452D]'
                            : 'bg-white border-gray-200 hover:bg-[#FAF8F1]'
                        }`}
                      >
                        <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Play size={14} className="text-white fill-white" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[#263328] line-clamp-1">{v.title}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{v.channel_title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <span className="text-[11px] font-bold text-[#65834C] uppercase tracking-wider block">
                    {activeModule.category} • {activeModule.difficulty}
                  </span>
                  <h2 className="font-display font-extrabold text-2xl text-[#24452D] mt-0.5">
                    {activeModule.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBookmark(activeModule)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      activeModule.user_progress?.bookmarked
                        ? 'bg-[#F3E9D5] text-[#24452D] border-[#24452D]'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FAF8F1]'
                    }`}
                  >
                    <Bookmark size={15} />
                    <span>{activeModule.user_progress?.bookmarked ? 'Saved' : 'Bookmark'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleComplete(activeModule)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer ${
                      activeModule.user_progress?.is_completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#24452D] hover:bg-[#31583b] text-white'
                    }`}
                  >
                    <CheckCircle size={15} />
                    <span>
                      {activeModule.user_progress?.is_completed
                        ? t('learn.completed')
                        : t('learn.mark_complete')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h4 className="font-display font-bold text-sm text-[#263328] mb-1">
                  Module Summary
                </h4>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {activeModule.summary}
                </p>
              </div>

              {/* Learning Objectives */}
              <div className="p-4 rounded-2xl bg-[#FAF8F1] border border-[#F3E9D5]">
                <h4 className="font-display font-bold text-sm text-[#24452D] flex items-center gap-2 mb-2">
                  <Award size={16} className="text-[#65834C]" />
                  <span>{t('learn.objectives')}</span>
                </h4>
                <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {activeModule.learning_objectives}
                </div>
              </div>

              {/* Step-by-Step Instructions */}
              <div>
                <h4 className="font-display font-bold text-sm text-[#263328] mb-2">
                  {t('learn.steps')}
                </h4>
                <div className="p-4 rounded-2xl bg-white border border-gray-200 text-xs text-gray-700 whitespace-pre-line leading-relaxed space-y-2">
                  {activeModule.steps_content}
                </div>
              </div>

              {/* Critical Safety Advisory for Module */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300">
                <h4 className="font-display font-bold text-xs text-amber-950 flex items-center gap-1.5 mb-1">
                  <AlertTriangle size={15} className="text-amber-700" />
                  <span>{t('learn.safety_warnings')}</span>
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {activeModule.safety_precautions}
                </p>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <p>Select a learning module to begin hands-on bamboo training.</p>
            </div>
          )}
        </div>
      </div>

      {/* CMRTC Machine Directory Section */}
      <div className="pt-12 border-t border-[#F3E9D5] space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#24452D]/10 text-[#24452D] text-xs font-bold">
            <Cpu size={14} className="text-[#65834C]" />
            <span>Industrial Equipment Specifications</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl text-[#24452D]">
            {t('learn.machine_title')}
          </h2>
          <p className="text-xs text-gray-600">
            {t('learn.machine_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {machines.map((mach) => {
            const isExpanded = expandedMachineId === mach.id

            return (
              <div
                key={mach.id}
                className="bg-white rounded-3xl border border-[#F3E9D5] p-6 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="aspect-16/10 rounded-2xl overflow-hidden bg-gray-100 mb-4">
                    <img
                      src={mach.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}
                      alt={mach.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="font-display font-bold text-lg text-[#24452D]">
                    {mach.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {mach.purpose}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div className="text-xs">
                    <span className="font-bold text-gray-700">Key Components: </span>
                    <span className="text-gray-600">{mach.main_components}</span>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2.5 pt-2 border-t border-dashed border-gray-200 text-xs animate-in fade-in duration-200">
                      <div>
                        <span className="font-bold text-gray-700">Maintenance: </span>
                        <span className="text-gray-600">{mach.maintenance_info}</span>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                        <span className="font-bold">Safety Directive: </span>
                        <span>{mach.safety_precautions}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">Price Estimate: </span>
                        <span className="text-[#65834C] font-semibold">{mach.indicative_price}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-700">Supplier: </span>
                        <span className="text-gray-600">{mach.supplier_info}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedMachineId(isExpanded ? null : mach.id)}
                    className="w-full py-2.5 rounded-xl bg-[#FAF8F1] hover:bg-[#F3E9D5] text-[#24452D] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Specifications' : 'View Maintenance & Safety'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
export default Learn
