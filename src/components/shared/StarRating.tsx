'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: number
  interactive?: boolean
  onRate?: (rating: number) => void
  className?: string
}

export default function StarRating({
  rating,
  size = 16,
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? 'button' : undefined}
          onClick={interactive && onRate ? () => onRate(star) : undefined}
          className={cn(
            interactive && 'cursor-pointer hover:scale-110 transition-transform active:scale-95',
            !interactive && 'cursor-default pointer-events-none'
          )}
          aria-label={interactive ? `Rate ${star} stars` : undefined}
        >
          <Star
            size={size}
            className={cn(
              star <= Math.round(rating)
                ? 'fill-warning text-warning'
                : 'fill-transparent text-muted-foreground/40'
            )}
          />
        </button>
      ))}
    </div>
  )
}
