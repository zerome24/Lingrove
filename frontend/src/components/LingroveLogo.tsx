import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface LogoProps {
  className?: string
  showSubtitle?: boolean
  showTagline?: boolean
  iconOnly?: boolean
  light?: boolean
}

export const LingroveLogo: React.FC<LogoProps> = ({
  className = '',
  showSubtitle = true,
  showTagline = false,
  iconOnly = false,
  light = false
}) => {
  const { t } = useTranslation()
  const [imgSrc, setImgSrc] = useState('/assets/lingrove-logo.png')

  const handleImgError = () => {
    if (imgSrc !== '/logo.png') {
      setImgSrc('/logo.png')
    }
  }

  const LogoImage = (
    <div className="relative flex-shrink-0 transition-transform group-hover:scale-105 duration-200 flex items-center justify-center">
      <img
        src={imgSrc}
        alt="LINGROVE Official Logo"
        onError={handleImgError}
        className={`object-contain rounded-xl drop-shadow-sm ${
          iconOnly ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-10 h-10 sm:w-12 sm:h-12'
        }`}
      />
    </div>
  )

  if (iconOnly) {
    return (
      <Link to="/" className={`inline-flex items-center group ${className}`} aria-label="LINGROVE">
        {LogoImage}
      </Link>
    )
  }

  return (
    <Link to="/" className={`flex items-center gap-3 group transition-transform ${className}`}>
      {LogoImage}

      <div className="flex flex-col justify-center">
        <span
          className={`font-display font-black tracking-wider text-xl sm:text-2xl leading-none transition-colors ${
            light ? 'text-[#FAF8F1]' : 'text-[#24452D] group-hover:text-[#1c3523]'
          }`}
        >
          {t('brand.name') || 'LINGROVE'}
        </span>
        {showSubtitle && (
          <span
            className={`text-[10px] sm:text-[11px] font-semibold tracking-tight mt-1 transition-colors ${
              light ? 'text-[#F3E9D5]/90' : 'text-[#65834C]'
            }`}
          >
            {t('brand.subtitle') || 'Lingala Bamboo Products at CMRTC'}
          </span>
        )}
        {showTagline && (
          <span
            className={`text-[9px] sm:text-[10px] italic mt-0.5 ${
              light ? 'text-amber-200/80' : 'text-amber-700'
            }`}
          >
            {t('brand.tagline') || 'Learn. Create. Sell. Grow Together.'}
          </span>
        )}
      </div>
    </Link>
  )
}

export default LingroveLogo
