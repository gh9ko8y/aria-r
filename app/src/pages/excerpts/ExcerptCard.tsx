import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, ChevronDown, ChevronUp, BookOpen, Mic } from 'lucide-react';
import type { Excerpt, Book } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ExcerptCardProps {
  excerpt: Excerpt;
  book: Book | undefined;
  index: number;
  onEdit: (excerpt: Excerpt) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  highlight?: boolean;
}

export default function ExcerptCard({ excerpt, book, index, onEdit, onDelete, onTagClick, highlight }: ExcerptCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const formattedDate = new Date(excerpt.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const contentClamped = excerpt.content.length > 180 && !expanded;
  const thoughtClamped = (excerpt.thought?.length ?? 0) > 140 && !expanded;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-[10px] border transition-all duration-300"
      style={{
        backgroundColor: highlight ? 'rgba(91, 126, 113, 0.05)' : '#F0F0F0',
        borderColor: '#E2E0D8',
        borderLeftWidth: '3px',
        borderLeftColor: '#5B7E71',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 24px rgba(44, 44, 44, 0.08)'
          : '0 1px 3px rgba(44, 44, 44, 0.04)',
      }}
    >
      <div className="p-4 md:p-5">
        {/* Source header */}
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: '#6B8FAD' }} />
          <span
            className="text-[13px] font-medium truncate"
            style={{
              color: '#6B8FAD',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.55,
            }}
          >
            {book?.title ?? '未知书籍'}
            {book?.author ? ` · ${book.author}` : ''}
          </span>
          {excerpt.chapter && (
            <span
              className="text-[11px] ml-auto flex-shrink-0"
              style={{
                color: '#9B9B8E',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                letterSpacing: '0.08em',
                lineHeight: 1.4,
              }}
            >
              {excerpt.chapter}
              {excerpt.page ? ` · p.${excerpt.page}` : ''}
            </span>
          )}
          {excerpt.isVoiceInput && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <Mic className="w-3 h-3" style={{ color: '#9B9B8E' }} />
            </span>
          )}
        </div>

        {/* Quote text */}
        <div
          className="mb-3 pl-3"
          style={{ borderLeft: '2px solid rgba(91, 126, 113, 0.2)' }}
        >
          <p
            className="italic"
            style={{
              fontSize: '17px',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
              color: '#2C2C2C',
            }}
          >
            {contentClamped ? `${excerpt.content.slice(0, 180)}...` : excerpt.content}
          </p>
          {excerpt.content.length > 180 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 inline-flex items-center gap-1 text-xs transition-colors duration-150 hover:underline"
              style={{ color: '#6B8FAD' }}
            >
              {expanded ? (
                <>收起 <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>展开 <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>

        {/* Thought */}
        {excerpt.thought && (
          <div
            className="mb-3 pl-3"
            style={{ borderLeft: '2px solid rgba(107, 107, 107, 0.15)' }}
          >
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                letterSpacing: '0.01em',
                fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
                color: '#6B6B6B',
              }}
            >
              {thoughtClamped ? `${excerpt.thought.slice(0, 140)}...` : excerpt.thought}
            </p>
            {excerpt.thought.length > 140 && !expanded && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-xs transition-colors duration-150 hover:underline"
                style={{ color: '#6B8FAD' }}
              >
                展开
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {excerpt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {excerpt.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="px-3 py-[3px] rounded-full text-[11px] transition-all duration-150 hover:brightness-95"
                style={{
                  backgroundColor: 'rgba(107, 143, 173, 0.1)',
                  color: '#6B8FAD',
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                  letterSpacing: '0.08em',
                  lineHeight: 1.4,
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span
            className="text-[13px]"
            style={{
              color: '#9B9B8E',
              fontFamily: 'Inter, system-ui, sans-serif',
              lineHeight: 1.55,
            }}
          >
            {formattedDate}
          </span>

          <div
            className="flex items-center gap-1 transition-opacity duration-200"
            style={{ opacity: hovered ? 1 : 0.6 }}
          >
            <button
              onClick={() => onEdit(excerpt)}
              className="p-1.5 rounded-md transition-all duration-150 hover:scale-105"
              style={{ color: '#6B6B6B' }}
              title="编辑"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-1.5 rounded-md transition-all duration-150 hover:scale-105"
                  style={{ color: '#C47C7C' }}
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent
                className="rounded-[16px] border"
                style={{
                  backgroundColor: '#F8F6F0',
                  borderColor: '#E2E0D8',
                  maxWidth: '400px',
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle
                    style={{
                      fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
                      color: '#2C2C2C',
                    }}
                  >
                    确认删除
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{ color: '#6B6B6B' }}>
                    这条摘录将被永久删除，此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    className="rounded-[8px] border"
                    style={{ borderColor: '#E2E0D8', color: '#6B6B6B' }}
                  >
                    取消
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(excerpt.id)}
                    className="rounded-[8px] text-white"
                    style={{ backgroundColor: '#C47C7C' }}
                  >
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
