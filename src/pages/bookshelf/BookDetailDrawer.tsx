import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Trash2, BookOpen, Calendar, Hash, Building2, FileText, Tag, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, ReadingStatus } from '@/types';
import { getExcerptsByBookId } from '@/lib/storage';
import StarRating from './StarRating';

interface BookDetailDrawerProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onStatusChange: (book: Book, status: ReadingStatus) => void;
  onUpdateBook?: (book: Book) => void;
}

const statusConfig: Record<ReadingStatus, { label: string; color: string; bg: string }> = {
  prelude: { label: '序曲', color: 'text-[#6B8FAD]', bg: 'bg-[#6B8FAD]/12' },
  andante: { label: '行板', color: 'text-[#5B7E71]', bg: 'bg-[#5B7E71]/12' },
  finale: { label: '终章', color: 'text-[#7BAE7F]', bg: 'bg-[#7BAE7F]/12' },
};

export default function BookDetailDrawer({
  book,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onUpdateBook,
}: BookDetailDrawerProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [localRating, setLocalRating] = useState(0);

  if (!book) return null;

  const status = statusConfig[book.status];
  const progressPercent = book.pageCount && book.currentPage
    ? Math.round((book.currentPage / book.pageCount) * 100)
    : 0;
  const excerpts = getExcerptsByBookId(book.id);

  const handleRatingChange = (newRating: number) => {
    setLocalRating(newRating);
    if (onUpdateBook && book) {
      onUpdateBook({ ...book, rating: newRating });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(44,44,44,0.3)] backdrop-blur-[4px]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 250,
              damping: 28,
            }}
            className={cn(
              'absolute right-0 top-0 h-full w-full sm:w-[480px] bg-[#F8F6F0] shadow-[0_24px_48px_rgba(44,44,44,0.12)] overflow-y-auto',
              'sm:rounded-l-2xl'
            )}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors cursor-pointer bg-[#F8F6F0]/80 backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="pb-8">
              {/* Header with Cover */}
              <div className="flex flex-col items-center pt-10 pb-6 px-6">
                {/* Cover */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="w-[180px] aspect-[2/3] rounded-xl overflow-hidden bg-[#E2E0D8] shadow-md mb-5"
                >
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#9B9B8E]">
                      <BookOpen size={48} className="opacity-40" />
                    </div>
                  )}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.3 }}
                  className="text-[24px] font-medium text-[#2C2C2C] text-center mb-1"
                  style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                >
                  {book.title}
                </motion.h2>

                {/* Author */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-[15px] text-[#6B6B6B] mb-3"
                >
                  {book.author}
                </motion.p>

                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className={cn('inline-flex items-center px-3 py-1 rounded-[6px] text-[12px] font-medium', status.bg, status.color)}
                >
                  {status.label}
                </motion.div>
              </div>

              <div className="px-6 space-y-6">
                {/* Basic Info Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {book.isbn && (
                    <div className="flex items-start gap-2 bg-[#F0F0F0] rounded-[10px] p-3">
                      <Hash size={14} className="text-[#9B9B8E] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#9B9B8E] mb-0.5">ISBN</p>
                        <p className="text-[13px] text-[#2C2C2C]">{book.isbn}</p>
                      </div>
                    </div>
                  )}
                  {book.publisher && (
                    <div className="flex items-start gap-2 bg-[#F0F0F0] rounded-[10px] p-3">
                      <Building2 size={14} className="text-[#9B9B8E] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#9B9B8E] mb-0.5">出版社</p>
                        <p className="text-[13px] text-[#2C2C2C]">{book.publisher}</p>
                      </div>
                    </div>
                  )}
                  {book.publishedYear && (
                    <div className="flex items-start gap-2 bg-[#F0F0F0] rounded-[10px] p-3">
                      <Calendar size={14} className="text-[#9B9B8E] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#9B9B8E] mb-0.5">出版年</p>
                        <p className="text-[13px] text-[#2C2C2C]">{book.publishedYear}</p>
                      </div>
                    </div>
                  )}
                  {book.pageCount && (
                    <div className="flex items-start gap-2 bg-[#F0F0F0] rounded-[10px] p-3">
                      <FileText size={14} className="text-[#9B9B8E] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-[#9B9B8E] mb-0.5">页数</p>
                        <p className="text-[13px] text-[#2C2C2C]">{book.pageCount} 页</p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Progress */}
                {book.status !== 'prelude' && book.pageCount && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[13px] font-medium text-[#2C2C2C]">阅读进度</h4>
                      <span className="text-[13px] text-[#5B7E71] font-medium">{progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E0D8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                        className="h-full bg-[#5B7E71] rounded-full"
                      />
                    </div>
                    <p className="text-[12px] text-[#9B9B8E] mt-1.5">
                      {book.currentPage || 0} / {book.pageCount} 页
                    </p>
                  </motion.div>
                )}

                {/* Rating */}
                {book.status === 'finale' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.3 }}
                  >
                    <h4 className="text-[13px] font-medium text-[#2C2C2C] mb-2">评分</h4>
                    <StarRating
                      rating={book.rating || localRating}
                      onRate={handleRatingChange}
                      size={22}
                    />
                  </motion.div>
                )}

                {/* Description */}
                {book.description && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <h4 className="text-[13px] font-medium text-[#2C2C2C] mb-2">简介</h4>
                    <p
                      className={cn(
                        'text-[14px] text-[#2C2C2C] leading-relaxed',
                        !showFullDesc && 'line-clamp-4'
                      )}
                      style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
                    >
                      {book.description}
                    </p>
                    {book.description.length > 200 && (
                      <button
                        onClick={() => setShowFullDesc(!showFullDesc)}
                        className="text-[12px] text-[#6B8FAD] mt-1 hover:underline"
                      >
                        {showFullDesc ? '收起' : '展开'}
                      </button>
                    )}
                  </motion.div>
                )}

                {/* Tags */}
                {book.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.3 }}
                  >
                    <h4 className="text-[13px] font-medium text-[#2C2C2C] mb-2 flex items-center gap-1.5">
                      <Tag size={13} className="text-[#9B9B8E]" />
                      标签
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {book.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 rounded-full text-[12px] bg-[#6B8FAD]/10 text-[#6B8FAD]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Excerpts */}
                {excerpts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                  >
                    <h4 className="text-[13px] font-medium text-[#2C2C2C] mb-3 flex items-center gap-1.5">
                      <Quote size={13} className="text-[#9B9B8E]" />
                      相关摘录 ({excerpts.length})
                    </h4>
                    <div className="space-y-3">
                      {excerpts.map((excerpt) => (
                        <div
                          key={excerpt.id}
                          className="bg-[#F0F0F0] rounded-[10px] p-3 border border-[#E2E0D8]"
                        >
                          <p
                            className="text-[14px] text-[#2C2C2C] italic leading-relaxed"
                            style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
                          >
                            {excerpt.content}
                          </p>
                          {excerpt.thought && (
                            <p className="text-[12px] text-[#6B6B6B] mt-2 pl-3 border-l-2 border-[#E2E0D8]">
                              {excerpt.thought}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.3 }}
                  className="flex gap-3 pt-4 border-t border-[#E2E0D8]"
                >
                  {book.status === 'prelude' && (
                    <button
                      onClick={() => onStatusChange(book, 'andante')}
                      className="flex-1 py-2.5 rounded-[10px] text-sm font-medium bg-[#5B7E71] text-white hover:brightness-105 transition-all"
                    >
                      开始阅读
                    </button>
                  )}
                  {book.status === 'andante' && (
                    <button
                      onClick={() => onStatusChange(book, 'finale')}
                      className="flex-1 py-2.5 rounded-[10px] text-sm font-medium bg-[#7BAE7F] text-white hover:brightness-105 transition-all"
                    >
                      标记完成
                    </button>
                  )}
                  {book.status === 'finale' && (
                    <button
                      onClick={() => onStatusChange(book, 'andante')}
                      className="flex-1 py-2.5 rounded-[10px] text-sm font-medium bg-[#6B8FAD] text-white hover:brightness-105 transition-all"
                    >
                      重新阅读
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(book)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm border border-[#E2E0D8] text-[#6B6B6B] hover:bg-[#F0F0F0] transition-all"
                  >
                    <Edit3 size={14} />
                    编辑
                  </button>
                  <button
                    onClick={() => onDelete(book)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm border border-[#E2E0D8] text-[#C47C7C] hover:bg-[#C47C7C]/10 transition-all"
                  >
                    <Trash2 size={14} />
                    删除
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
