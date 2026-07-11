import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  rating: number
  onRate?: (rating: number) => void
  size?: number
}

export default function StarRating({ rating, onRate, size = 16 }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-colors"
          disabled={!onRate}
        >
          <Star
            size={size}
            fill={(hover || rating) >= star ? 'var(--accent-warm)' : 'transparent'}
            stroke={(hover || rating) >= star ? 'var(--accent-warm)' : 'var(--text-muted)'}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}
