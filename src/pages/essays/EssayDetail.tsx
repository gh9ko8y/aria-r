import { motion } from 'framer-motion';
import { X, Edit3, Trash2, Pin, PinOff, BookOpen, MapPin, CloudSun, Smile } from 'lucide-react';
import type { Essay } from '@/types';
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

interface EssayDetailProps {
  essay: Essay | null;
  bookTitle?: string;
  onClose: () => void;
  onEdit: (essay: Essay) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export default function EssayDetail({ essay, bookTitle, onClose, onEdit, onDelete, onTogglePin }: EssayDetailProps) {
  if (!essay) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Convert markdown-like syntax to styled elements
  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.trim() === '') {
        return <div key={i} className="h-3" />;
      }

      // Handle **bold** and *italic*
      let processedLine = line;
      const parts: (string | React.ReactNode)[] = [];
      let lastIndex = 0;

      // Simple parser for **bold** and *italic*
      const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
      let match;
      let keyIdx = 0;

      while ((match = regex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(processedLine.slice(lastIndex, match.index));
        }
        if (match[2]) {
          // Bold
          parts.push(
            <strong key={`b${keyIdx++}`} className="font-semibold" style={{ color: '#2C2C2C' }}>
              {match[2]}
            </strong>
          );
        } else if (match[3]) {
          // Italic
          parts.push(
            <em key={`e${keyIdx++}`} className="italic" style={{ color: '#4A4A4A' }}>
              {match[3]}
            </em>
          );
        }
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      if (parts.length === 0) {
        parts.push(line);
      }

      return (
        <p
          key={i}
          className="text-[15px] leading-relaxed mb-1"
          style={{
            fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
            color: '#2C2C2C',
            letterSpacing: '0.01em',
            lineHeight: 1.75,
          }}
        >
          {parts}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(44, 44, 44, 0.3)', backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[560px] sm:rounded-[16px] rounded-t-[16px] max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: '#F8F6F0',
          boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#E2E0D8] bg-[#F8F6F0] rounded-t-[16px]">
          <div className="flex items-center gap-2">
            {essay.isPinned ? (
              <button
                onClick={() => onTogglePin(essay.id)}
                className="p-1.5 rounded-md transition-all hover:scale-110"
                title="取消置顶"
              >
                <Pin className="w-4 h-4 text-[#A67C52]" fill="#A67C52" />
              </button>
            ) : (
              <button
                onClick={() => onTogglePin(essay.id)}
                className="p-1.5 rounded-md transition-all hover:scale-110 opacity-50 hover:opacity-100"
                title="置顶"
              >
                <PinOff className="w-4 h-4 text-[#9B9B8E]" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(essay)}
              className="p-2 rounded-md transition-all duration-150 hover:scale-105"
              style={{ color: '#6B6B6B' }}
              title="编辑"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="p-2 rounded-md transition-all duration-150 hover:scale-105"
                  style={{ color: '#C47C7C' }}
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
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
                    这篇随笔将被永久删除，此操作无法撤销。
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
                    onClick={() => onDelete(essay.id)}
                    className="rounded-[8px] text-white"
                    style={{ backgroundColor: '#C47C7C' }}
                  >
                    删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              onClick={onClose}
              className="p-2 rounded-md transition-all duration-150 hover:scale-105 ml-1"
              style={{ color: '#6B6B6B' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          {/* Title */}
          <h2
            className="text-[22px] font-medium mb-3"
            style={{
              fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
              color: '#2C2C2C',
              lineHeight: 1.3,
              letterSpacing: '0.01em',
            }}
          >
            {essay.title}
          </h2>

          {/* Meta info: mood, location, weather */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {essay.mood && (
              <span className="flex items-center gap-1 text-[12px]" style={{ color: '#9B9B8E' }}>
                <Smile className="w-3.5 h-3.5" />
                {essay.mood}
              </span>
            )}
            {essay.location && (
              <span className="flex items-center gap-1 text-[12px]" style={{ color: '#9B9B8E' }}>
                <MapPin className="w-3.5 h-3.5" />
                {essay.location}
              </span>
            )}
            {essay.weather && (
              <span className="flex items-center gap-1 text-[12px]" style={{ color: '#9B9B8E' }}>
                <CloudSun className="w-3.5 h-3.5" />
                {essay.weather}
              </span>
            )}
            <span
              className="text-[12px]"
              style={{
                color: '#9B9B8E',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {formatDate(essay.createdAt)}
            </span>
          </div>

          {/* Cover image in detail */}
          {essay.coverImage && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={essay.coverImage}
                alt={essay.title}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '300px' }}
              />
            </div>
          )}

          {/* Body */}
          <div className="mb-4">
            {renderContent(essay.content)}
          </div>

          {/* Related book */}
          {bookTitle && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4"
              style={{ backgroundColor: 'rgba(107, 143, 173, 0.08)' }}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: '#6B8FAD' }} />
              <span
                className="text-[13px]"
                style={{
                  color: '#6B8FAD',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                关联书籍：《{bookTitle}》
              </span>
            </div>
          )}

          {/* Tags */}
          {essay.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {essay.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-[3px] rounded-full text-[11px]"
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
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
