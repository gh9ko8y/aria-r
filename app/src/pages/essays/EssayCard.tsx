import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pin, BookOpen } from 'lucide-react';
import type { Essay } from '@/types';

interface EssayCardProps {
  essay: Essay;
  index: number;
  bookTitle?: string;
  onClick: () => void;
  onTogglePin: () => void;
}

export default function EssayCard({ essay, index, bookTitle, onClick, onTogglePin }: EssayCardProps) {
  const [hovered, setHovered] = useState(false);

  // Format date as month-day (e.g., "6月10日")
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // Truncate title to 1 line
  const truncatedTitle = essay.title.length > 24 ? `${essay.title.slice(0, 24)}...` : essay.title;

  // Truncate content to 2 lines (~48 chars per line roughly)
  const maxPreviewLength = 72;
  const truncatedContent = essay.content.length > maxPreviewLength
    ? `${essay.content.slice(0, maxPreviewLength)}...`
    : essay.content;

  // Visible tags (max 2)
  const visibleTags = essay.tags.slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="break-inside-avoid mb-4 rounded-[12px] border border-[#E2E0D8] bg-[#F0F0F0] p-4 cursor-pointer transition-all duration-300"
      style={{
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 24px rgba(44, 44, 44, 0.08)'
          : '0 1px 3px rgba(44, 44, 44, 0.04)',
      }}
    >
      {/* Cover image (if exists) */}
      {essay.coverImage && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img
            src={essay.coverImage}
            alt={essay.title}
            className="w-full h-auto object-cover"
            style={{ maxHeight: '200px' }}
          />
        </div>
      )}

      {/* Header: Pin + Title */}
      <div className="flex items-start gap-2 mb-2">
        <h3
          className="flex-1 text-[16px] font-medium leading-tight truncate"
          style={{
            fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
            color: '#2C2C2C',
            letterSpacing: '0.01em',
          }}
        >
          {truncatedTitle}
        </h3>
        {essay.isPinned && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="flex-shrink-0 p-1 rounded-md transition-all duration-150 hover:scale-110"
            title="取消置顶"
          >
            <Pin className="w-3.5 h-3.5 text-[#A67C52]" fill="#A67C52" />
          </button>
        )}
        {!essay.isPinned && hovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="flex-shrink-0 p-1 rounded-md transition-all duration-150 hover:scale-110 opacity-50 hover:opacity-100"
            title="置顶"
          >
            <Pin className="w-3.5 h-3.5 text-[#9B9B8E]" />
          </button>
        )}
      </div>

      {/* Content preview */}
      <p
        className="text-[14px] leading-relaxed mb-3 line-clamp-2"
        style={{
          fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
          color: '#6B6B6B',
          letterSpacing: '0.01em',
          lineHeight: 1.65,
        }}
      >
        {truncatedContent}
      </p>

      {/* Related book */}
      {bookTitle && (
        <div className="flex items-center gap-1.5 mb-2.5">
          <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: '#6B8FAD' }} />
          <span
            className="text-[11px] truncate"
            style={{
              color: '#6B8FAD',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {bookTitle}
          </span>
        </div>
      )}

      {/* Footer: Tags + Date */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-[2px] rounded-full text-[11px]"
              style={{
                backgroundColor: 'rgba(107, 143, 173, 0.1)',
                color: '#6B8FAD',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                letterSpacing: '0.04em',
                lineHeight: 1.4,
              }}
            >
              {tag}
            </span>
          ))}
          {essay.tags.length > 2 && (
            <span
              className="px-2 py-[2px] text-[11px]"
              style={{ color: '#9B9B8E' }}
            >
              +{essay.tags.length - 2}
            </span>
          )}
        </div>

        <span
          className="text-[11px] flex-shrink-0 ml-2"
          style={{
            color: '#9B9B8E',
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          {formatDate(essay.createdAt)}
        </span>
      </div>
    </motion.div>
  );
}
