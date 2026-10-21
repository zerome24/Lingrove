import React from 'react'
import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: number
  interactive?: boolean
  onChange?: (rating: number) => void
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  interactive = false,
  onChange
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starValue = index + 1
        const isFilled = rating >= starValue
        const isHalf = rating >= starValue - 0.5 && rating < starValue

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} p-0.5`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'text-[#E8A64A] fill-[#E8A64A]'
                  : isHalf
                  ? 'text-[#E8A64A] fill-[#E8A64A]/50'
                  : 'text-gray-300'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
