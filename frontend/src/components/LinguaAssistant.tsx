import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX,
  Sparkles, Bot, User as UserIcon, ExternalLink, CornerDownLeft
} from 'lucide-react'
import api from '../services/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  action?: string
  actionData?: string
  chips?: string[]
}

interface LinguaAssistantProps {
  onOpenCalculator?: () => void
  onOpenBulk?: () => void
}

export const LinguaAssistant: React.FC<LinguaAssistantProps> = ({
  onOpenCalculator,
  onOpenBulk
}) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(true)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Load browser speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        setAvailableVoices(voices)
      }
      updateVoices()
      window.speechSynthesis.onvoiceschanged = updateVoices
    }
  }, [])

  // Initialize initial greeting in selected language
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeTexts: Record<string, string> = {
        te: "నమస్కారం! నేను లింగువా, లింగ్రోవ్ సహాయకురాలిని. వెదురు నైపుణ్యాలు నేర్చుకోవడానికి, ఉత్పత్తులు కొనడానికి లేదా గ్యాలరీ చూడటానికి నేను మీకు సహాయపడగలను.",
        hi: "नमस्ते! मैं लिंगुआ हूँ, लिंग्रोव बहुभाषी सहायक। बाँस शिल्प सीखने, उत्पाद खरीदने या कार्यशाला गैलरी देखने में मैं आपकी क्या मदद करूँ?",
        en: "Hello! I am Lingua, your multilingual guide for Lingrove (Lingala Bamboo Products at CMRTC). How can I assist you with craftsmanship or marketplace shopping today?"
      }

      const initialChips: Record<string, string[]> = {
        te: ["వెదురు బుట్టలు నేర్చుకోండి", "మార్కెట్‌ప్లేస్ చూడండి", "గ్యాలరీ చూడండి", "ధరల కాలిక్యులేటర్"],
        hi: ["बाँस शिल्प सीखें", "मार्केटप्लेस देखें", "गैलरी देखें", "लागत कैलकुलेटर"],
        en: ["Learn Bamboo Craft", "Browse Marketplace", "View Gallery", "Cost Calculator"]
      }

      const currentLang = i18n.language in welcomeTexts ? i18n.language : 'en'

      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          text: welcomeTexts[currentLang],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chips: initialChips[currentLang]
        }
      ])
    }
  }, [i18n.language])

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSendRef = useRef<(text?: string) => Promise<void>>(null)

  // Setup Browser Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
      if (handleSendRef.current && transcript.trim()) {
        handleSendRef.current(transcript.trim())
      }
    }

    recognition.onerror = (e: any) => {
      console.warn('Speech recognition error', e)
      setIsListening(false)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        alert(t('assistant.voice_not_supported') || 'Microphone access was denied. Please allow microphone permissions or use text chat.')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [t])

  const toggleListening = () => {
    if (!speechSupported) {
      alert(t('assistant.voice_not_supported') || 'Speech recognition is not supported in this browser. Please use text chat.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        const langCode = i18n.language === 'te' ? 'te-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-IN'
        recognitionRef.current.lang = langCode
        recognitionRef.current.start()
        setIsListening(true)
      } catch (err) {
        console.warn('Speech recognition start issue', err)
        setIsListening(false)
      }
    }
  }

  const speakText = (text: string, langCode?: string) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const rawLang = langCode || i18n.language
    const targetLang = rawLang === 'te' ? 'te-IN' : rawLang === 'hi' ? 'hi-IN' : rawLang === 'en' ? 'en-IN' : rawLang
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = targetLang
    utterance.rate = 0.95

    // Select matched voice if available
    const voicePrefix = targetLang.split('-')[0].toLowerCase()
    const matchedVoice = availableVoices.find(
      (v) => v.lang.toLowerCase().startsWith(voicePrefix) || v.lang.toLowerCase().includes(voicePrefix)
    )
    if (matchedVoice) {
      utterance.voice = matchedVoice
      window.speechSynthesis.speak(utterance)
    } else if (voicePrefix === 'en') {
      window.speechSynthesis.speak(utterance)
    } else {
      // Do not synthesize Telugu/Hindi using English voice to prevent distorted audio
      console.info(`Regional voice for ${targetLang} is not installed on this system. Response is presented as text.`)
    }
  }

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input
    if (!textToSend.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.text
      }))

      const res = await api.post('/assistant/chat', {
        message: textToSend,
        language: i18n.language,
        current_path: location.pathname,
        conversation_history: historyPayload
      })

      const botReply = res.data.reply
      const action = res.data.action
      const actionData = res.data.action_data
      const responseLang = res.data.language
      const suggestedChips = res.data.suggested_chips || []

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action,
        actionData,
        chips: suggestedChips
      }

      setMessages((prev) => [...prev, botMsg])
      speakText(botReply, responseLang)

      // Execute intent action
      if (action === 'NAVIGATE' && actionData) {
        setTimeout(() => {
          navigate(actionData)
        }, 900)
      } else if (action === 'CHANGE_LANG' && actionData) {
        i18n.changeLanguage(actionData)
      } else if (action === 'OPEN_CALCULATOR') {
        if (onOpenCalculator) onOpenCalculator()
      } else if (action === 'OPEN_BULK') {
        if (onOpenBulk) onOpenBulk()
      }
    } catch {
      const fallbackReplies: Record<string, string> = {
        te: "నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. మీరు మా లెర్నింగ్ సెంటర్, మార్కెట్‌ప్లేస్ లేదా గ్యాలరీని అన్వేషించవచ్చు!",
        hi: "मैं आपकी सहायता के लिए यहाँ हूँ। आप हमारे लर्निंग सेंटर, मार्केटप्लेस या फोटो गैलरी को देख सकते हैं!",
        en: "I am here to guide you through Lingrove. You can explore our Learning Center, browse products, view the gallery, or use the cost calculator!"
      }
      const langKey = i18n.language in fallbackReplies ? i18n.language : 'en'

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: fallbackReplies[langKey],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: ["/learn", "/products", "/gallery"]
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  handleSendRef.current = handleSend

  const handleChipClick = (chipText: string) => {
    setInput(chipText)
    handleSend(chipText)
  }

  return (
    <>
      {/* Floating Assistant Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full bg-[#24452D] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2.5 cursor-pointer ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        aria-label="Open Lingua Multilingual Voice Assistant"
      >
        <div className="relative">
          <Bot size={26} className="text-[#E8A64A]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>
        <span className="font-display font-bold text-sm pr-1 hidden sm:inline text-[#FAF8F1]">
          Lingua AI
        </span>
      </button>

      {/* Assistant Modal / Sliding Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[420px] max-h-[88vh] h-[640px] bg-white rounded-3xl shadow-2xl border border-[#F3E9D5] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#24452D] to-[#1B3823] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF8F1]/10 flex items-center justify-center border border-white/20">
                <Bot size={22} className="text-[#E8A64A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-sm tracking-wide">Lingua AI Assistant</h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#65834C] text-[#FAF8F1]">
                    {i18n.language.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-[#F3E9D5]/80">Lingala Bamboo Products at CMRTC</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setSpeechEnabled(!speechEnabled)
                  if (speechEnabled) window.speechSynthesis?.cancel()
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title={speechEnabled ? 'Mute voice audio' : 'Enable voice audio'}
              >
                {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-amber-300" />}
              </button>
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel()
                  setIsOpen(false)
                }}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                title="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF8F1]/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[86%]">
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-[#24452D] text-white flex items-center justify-center flex-shrink-0 mb-1">
                      <Bot size={14} className="text-[#E8A64A]" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-[#24452D] text-white rounded-br-xs shadow-sm font-medium'
                        : 'bg-white text-gray-800 rounded-bl-xs border border-[#F3E9D5] shadow-sm'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        m.role === 'user' ? 'text-white/60 text-right' : 'text-gray-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {m.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-[#65834C] text-white flex items-center justify-center flex-shrink-0 mb-1">
                      <UserIcon size={14} />
                    </div>
                  )}
                </div>

                {/* Suggested Action Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 ml-8 max-w-[85%]">
                    {m.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className="px-2.5 py-1 rounded-full bg-white border border-[#65834C]/40 text-[#24452D] hover:bg-[#F3E9D5] text-[10px] font-semibold transition-colors cursor-pointer shadow-2xs"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs pl-2">
                <Sparkles size={14} className="animate-spin text-[#65834C]" />
                <span>Lingua is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Listening Bar Indicator */}
          {isListening && (
            <div className="px-4 py-2 bg-amber-500/15 border-t border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-2">
                <Mic size={14} className="text-amber-700 animate-bounce" />
                Listening in {i18n.language === 'te' ? 'Telugu (తెలుగు)' : i18n.language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}...
              </span>
              <button
                onClick={toggleListening}
                className="text-[10px] underline font-bold text-amber-950"
              >
                Stop
              </button>
            </div>
          )}

          {/* Footer Input Bar */}
          <div className="p-3 bg-white border-t border-[#F3E9D5]">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#FAF8F1] hover:bg-[#F3E9D5] text-[#24452D]'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak voice input'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              )}

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  i18n.language === 'te'
                    ? "తెలుగు, హిందీ లేదా ఇంగ్లీషులో అడగండి..."
                    : i18n.language === 'hi'
                    ? "हिन्दी, तेलुगु या अंग्रेजी में पूछें..."
                    : "Ask in English, Telugu, or Hindi..."
                }
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F1] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#65834C] text-xs"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-2xl bg-[#24452D] hover:bg-[#31583b] disabled:opacity-40 text-white transition-all cursor-pointer"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
export default LinguaAssistant
