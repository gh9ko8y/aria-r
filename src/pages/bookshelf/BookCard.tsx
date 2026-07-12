import { motion } from 'framer-motion';
import { Edit3, Trash2, Check, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, ReadingStatus } from '@/types';
import StarRating from './StarRating';

interface BookCardProps {
  book: Book;
  index: number;
  onOpenDetail: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onStatusChange: (book: Book, status: ReadingStatus) => void;
}

const statusConfig: Record<ReadingStatus, { label: string; color: string; bg: string }> = {
  prelude: { label: '序曲', color: 'text-[#6B8FAD]', bg: 'bg-[#6B8FAD]/12' },
  andante: { label: '行板', color: 'text-[#5B7E71]', bg: 'bg-[#5B7E71]/12' },
  finale: { label: '终章', color: 'text-[#7BAE7F]', bg: 'bg-[#7BAE7F]/12' },
};

export default function BookCard({
  book,
  index,
  onOpenDetail,
  onEdit,
  onDelete,
  onStatusChange,
}: BookCardProps) {
  const status = statusConfig[book.status];
  const progressPercent = book.pageCount && book.currentPage
    ? Math.round((book.currentPage / book.pageCount) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      className="group relative"
    >
      <div
        onClick={() => onOpenDetail(book)}
        className={cn(
          'bg-[#F0F0F0] border border-[#E2E0D8] rounded-[10px] overflow-hidden cursor-pointer',
          'shadow-[0_1px_3px_rgba(44,44,44,0.04)]',
          'transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(44,44,44,0.08)]'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}
      >
        {/* Cover Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#E2E0D8]">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#9B9B8E]">
              <BookOpen size={40} className="mb-2 opacity-40" />
              <span className="text-sm px-4 text-center line-clamp-2">{book.title}</span>
            </div>
          )}

          {/* Quick Actions - appear on hover */}
          <div className="absolute bottom-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(book); }}
              className="w-8 h-8 rounded-full bg-[#F0F0F0]/90 backdrop-blur-sm flex items-center justify-center text-[#6B6B6B] hover:text-[#5B7E71] hover:bg-[#F0F0F0] transition-colors shadow-sm cursor-pointer"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(book); }}
              className="w-8 h-8 rounded-full bg-[#F0F0F0]/90 backdrop-blur-sm flex items-center justify-center text-[#6B6B6B] hover:text-[#C47C7C] hover:bg-[#F0F0F0] transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
            {book.status === 'prelude' && (
              <button
                onClick={(e) => { e.stopPropagation(); onStatusChange(book, 'andante'); }}
                className="w-8 h-8 rounded-full bg-[#F0F0F0]/90 backdrop-blur-sm flex items-center justify-center text-[#6B6B6B] hover:text-[#5B7E71] hover:bg-[#F0F0F0] transition-colors shadow-sm cursor-pointer"
              >
                <Check size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Status Badge */}
          <div className={cn('inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-medium tracking-wider mb-2', status.bg, status.color)}>
            {status.label}
          </div>

          {/* Title */}
          <h3
            className="text-[17px] font-medium text-[#2C2C2C] line-clamp-2 mb-1 leading-tight"
            style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            {book.title}
          </h3>

          {/* Author */}
          <p className="text-[13px] text-[#6B6B6B] mb-3">{book.author}</p>

          {/* Progress Bar */}
          {book.status !== 'prelude' && book.pageCount && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[11px] text-[#9B9B8E] mb-1">
                <span>进度</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1 w-full bg-[#E2E0D8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-[#5B7E71] rounded-full"
                />
              </div>
            </div>
          )}

          {/* Rating - only for finale */}
          {book.status === 'finale' && book.rating && (
            <StarRating rating={book.rating} size={14} />
          )}

          {/* Tags */}
          {book.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {book.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#6B8FAD]/10 text-[#6B8FAD]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}