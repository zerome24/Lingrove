import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, Check, ShieldCheck } from 'lucide-react'
import { Product } from '../types'
import { RatingStars } from './RatingStars'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { getMatchingBambooProductImage } from '../utils/productImages'

interface ProductCardProps {
  product: Product
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const fallbackImage = getMatchingBambooProductImage(product.title, product.category?.slug)
  const initialImage = product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    fallbackImage
  const [imageSrc, setImageSrc] = useState(initialImage)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)
    const success = await addToCart(product.id, 1, product)
    setIsAdding(false)
    if (success) {
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    }
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#F3E9D5] shadow-sm hover:shadow-bamboo transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Image Container */}
        <Link to={`/products/${product.id}`} className="block relative aspect-4/3 overflow-hidden bg-[#FAF8F1]">
          <img
            src={imageSrc}
            alt={product.title}
            onError={() => setImageSrc(fallbackImage)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {product.is_demo && (
              <span className="bg-[#24452D]/90 text-white text-[10px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                CMRTC DEMO
              </span>
            )}
            {product.category && (
              <span className="bg-white/90 text-[#24452D] text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs">
                {t(`categories.${product.category.slug}`) || product.category.name}
              </span>
            )}
          </div>

          {/* Stock tag */}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute bottom-2 right-2 bg-amber-500/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              Only {product.stock} left
            </div>
          )}
        </Link>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          {/* Artisan badge */}
          {product.artisan && (
            <div className="flex items-center gap-1.5 text-xs text-[#65834C] font-medium mb-1.5">
              <ShieldCheck size={14} className="text-[#65834C]" />
              <span>{product.artisan.artisan_name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{product.artisan.village}</span>
            </div>
          )}

          {/* Product Title */}
          <Link to={`/products/${product.id}`}>
            <h3 className="font-display font-bold text-lg text-[#263328] group-hover:text-[#24452D] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <RatingStars rating={product.rating} size={14} />
            <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
            <span className="text-xs text-gray-400">({product.review_count})</span>
          </div>

          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer / Price & Add to Cart */}
      <div className="p-4 sm:p-5 pt-0 border-t border-[#F3E9D5]/60 mt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 block">
            {product.sku ? `SKU: ${product.sku}` : 'Price'}
          </span>
          {product.discount_price && product.discount_price > 0 ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#24452D]">
                ₹{product.discount_price.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
          ) : (
            <span className="font-display font-extrabold text-xl text-[#24452D]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAdding || product.stock === 0}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            justAdded
              ? 'bg-[#65834C] text-white'
              : product.stock === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#24452D] hover:bg-[#31583b] text-white active:scale-95 shadow-sm'
          }`}
        >
          {justAdded ? (
            <>
              <Check size={14} />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>{t('products.add_to_cart')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
