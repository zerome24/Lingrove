import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LingroveLogo } from './LingroveLogo'
import { MapPin, Phone, Mail, Award, Leaf, Heart } from 'lucide-react'

export const Footer: React.FC = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#183120] text-[#FAF8F1] pt-16 pb-12 border-t border-[#24452D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <LingroveLogo light />
            <p className="text-xs text-[#F3E9D5]/80 leading-relaxed">
              {t('brand.tagline')}
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t('footer.initiative')}
            </p>
            <div className="flex items-center gap-2 pt-2 text-[#E8A64A] text-xs font-semibold">
              <Leaf size={16} />
              <span>100% Sustainable Natural Bamboo</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-[#E8A64A] mb-4">
              {t('footer.links')}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FAF8F1]/80">
              <li>
                <Link to="/learn" className="hover:text-white hover:underline transition-colors">
                  {t('nav.learn')}
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white hover:underline transition-colors">
                  {t('nav.marketplace')}
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white hover:underline transition-colors">
                  {t('nav.gallery') || 'Gallery'}
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white hover:underline transition-colors">
                  {t('nav.reviews')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white hover:underline transition-colors">
                  {t('nav.profile')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Learning Pillars */}
          <div>
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-[#E8A64A] mb-4">
              CMRTC Craft Portal
            </h4>
            <ul className="space-y-2.5 text-xs text-[#FAF8F1]/80">
              <li>Bamboo Cutting & Slicing</li>
              <li>Splitting & Strip Calibration</li>
              <li>Traditional Lingala Basketry</li>
              <li>Modern Bamboo Furniture</li>
              <li>Machine Operation Awareness</li>
              <li>Surface Treatment & Polishing</li>
            </ul>
          </div>

          {/* Contact & Village Center */}
          <div>
            <h4 className="font-display font-bold text-sm tracking-wider uppercase text-[#E8A64A] mb-4">
              {t('footer.contact')}
            </h4>
            <div className="space-y-3 text-xs text-[#FAF8F1]/80">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#65834C] flex-shrink-0 mt-0.5" />
                <span>{t('footer.address')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#65834C] flex-shrink-0" />
                <span>+91 90590 76675 (WhatsApp Support)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#65834C] flex-shrink-0" />
                <span>contact@lingrove.org | cmrtc.bamboo@edu.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Partner Banner */}
        <div className="py-5 px-6 mb-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <img
              src="/assets/cmrtc-logo.png"
              onError={(e) => { (e.target as HTMLImageElement).src = '/cmrtc logo.png' }}
              alt="CMR Technical Campus (CMRTC) Logo"
              className="h-12 w-auto object-contain bg-white/95 p-1 rounded-xl shadow-xs"
            />
            <div>
              <h5 className="font-display font-bold text-sm text-[#FAF8F1]">
                Incubated with CMR Technical Campus (CMRTC)
              </h5>
              <p className="text-xs text-gray-300">
                Department of Rural Entrepreneurship & Bamboo Technology Incubation Cell • Lingala Village Initiative
              </p>
            </div>
          </div>
          <div className="text-right sm:block hidden">
            <span className="text-[11px] font-bold text-[#E8A64A] tracking-wider uppercase">
              Technology & Craft Empowerment
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} LINGROVE — {t('brand.subtitle')}. {t('footer.rights')}</p>
          <div className="flex items-center gap-1 text-gray-400">
            <span>Crafted with</span>
            <Heart size={13} className="text-red-400 fill-red-400" />
            <span>for rural entrepreneurship & sustainability</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
