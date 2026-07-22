import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import type { Book } from '@/types';

interface BookReaderProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
}

const WORDS_PER_PAGE = 800;

function getReadingPosition(bookId: string): number {
  try {
    const saved = localStorage.getItem(`aria-r:reading-pos:${bookId}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveReadingPosition(bookId: string, page: number): void {
  try {
    localStorage.setItem(`aria-r:reading-pos:${bookId}`, page.toString());
  } catch {
    // ignore
  }
}

export default function BookReader({ book, isOpen, onClose }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const content = book.content || '';
  const pages: string[] = [];

  if (content) {
    const paragraphs = content.split('\n').filter(p => p.trim());
    let pageContent = '';

    for (const para of paragraphs) {
      if ((pageContent + '\n' + para).length > WORDS_PER_PAGE && pageContent.length > 0) {
        pages.push(pageContent.trim());
        pageContent = para;
      } else {
        pageContent = pageContent ? pageContent + '\n' + para : para;
      }
    }
    if (pageContent.trim()) {
      pages.push(pageContent.trim());
    }
  }

  const totalPages = Math.max(pages.length, 1);
  const hasContent = content.length > 0;

  // 打开时恢复上次阅读位置
  useEffect(() => {
    if (isOpen && hasContent) {
      const savedPage = getReadingPosition(book.id);
      setCurrentPage(Math.min(savedPage, totalPages - 1));
    }
  }, [isOpen, book.id, totalPages, hasContent]);

  function goToPage(page: number) {
    const newPage = Math.max(0, Math.min(page, totalPages - 1));
    setCurrentPage(newPage);
    saveReadingPosition(book.id, newPage);
  }

  // 键盘翻页
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(44,44,44,0.5)] backdrop-blur-[4px]"
          />

          {/* Reader */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-[700px] max-h-[85vh] bg-[#F8F6F0] rounded-2xl shadow-[0_24px_48px_rgba(44,44,44,0.12)] z-10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E0D8]">
              <div>
                <h3
                  className="text-[18px] font-medium text-[#2C2C2C]"
                  style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                >
                  {book.title}
                </h3>
                <p className="text-[12px] text-[#6B6B6B] mt-0.5">{book.author}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {hasContent ? (
                <div
                  className="text-[15px] leading-[1.8] text-[#2C2C2C] whitespace-pre-wrap"
                  style={{ fontFamily: '"Source Han Serif CN", "Songti SC", serif' }}
                >
                  {pages[currentPage] || content}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <BookOpen size={48} className="text-[#E2E0D8] mb-4" />
                  <p className="text-[16px] text-[#6B6B6B] mb-2">暂无书籍内容</p>
                  <p className="text-[13px] text-[#9B9B8E]">请在编辑书籍时添加内容</p>
                </div>
              )}
            </div>

            {/* Footer - Pagination */}
            {hasContent && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E0D8]">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  上一页
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#9B9B8E]">
                    进度 {Math.round(((currentPage + 1) / totalPages) * 100)}%
                  </span>
                  <span className="text-[13px] text-[#6B6B6B]">
                    {currentPage + 1} / {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  下一页
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
