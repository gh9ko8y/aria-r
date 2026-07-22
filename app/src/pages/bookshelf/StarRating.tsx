import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  onRate?: (rating: number) => void;
  size?: number;
  className?: string;
}

export default function StarRating({ rating = 0, onRate, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate?.(star)}
          disabled={!onRate}
          className={cn(
            'transition-transform',
            onRate && 'hover:scale-110 cursor-pointer',
            !onRate && 'cursor-default'
          )}
        >
          <Star
            size={size}
            className={cn(
              'transition-colors',
              star <= rating
                ? 'fill-[#A67C52] text-[#A67C52]'
                : 'fill-transparent text-[#9B9B8E]'
            )}
          />
        </button>
      ))}
    </div>
  );
}
