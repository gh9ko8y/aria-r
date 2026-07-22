import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
  BookOpen,
  BookMarked,
  PenTool,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  initializeData,
  getGreeting,
  getReadingStats,
  getCurrentlyReading,
  getRecentExcerpts,
  getBooks,
} from '@/lib/storage';
import type { Book, Excerpt } from '@/types';

/* ──────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function StatPill({
  label,
  value,
  icon: Icon,
  color,
  bg,
  onClick,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(44,44,44,0.07)' }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-3 bg-[#F0F0F0] rounded-[10px] px-4 py-3 border border-[#E2E0D8] text-left hover:shadow-[0_4px_12px_rgba(44,44,44,0.05)] transition-all duration-300"
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
        <Icon size={18} strokeWidth={1.5} className={color} />
      </div>
      <div className="min-w-0">
        <div className="text-[20px] font-bold text-[#2C2C2C] leading-tight">{value}</div>
        <div className="text-[11px] text-[#6B6B6B]">{label}</div>
      </div>
    </motion.button>
  );
}

function CurrentlyReadingCard({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(44,44,44,0.08)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-4 bg-[#F0F0F0] rounded-[10px] p-4 border border-[#E2E0D8] text-left hover:shadow-[0_4px_12px_rgba(44,44,44,0.06)] transition-all duration-300 w-full"
    >
      {/* Book cover placeholder */}
      <div className="w-12 h-16 rounded-md bg-[#5B7E71]/10 flex items-center justify-center shrink-0 border border-[#E2E0D8]">
        <BookOpen size={20} strokeWidth={1.5} className="text-[#5B7E71]/60" />
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className="text-[14px] font-semibold text-[#2C2C2C] truncate"
          style={{ fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif' }}
        >
          {book.title}
        </h3>
        <p className="text-[12px] text-[#6B6B6B] mt-0.5">{book.author}</p>

        {/* Progress bar */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-[#E2E0D8] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#5B7E71]"
              initial={{ width: 0 }}
              animate={{ width: `${book.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <span className="text-[11px] text-[#9B9B8E] tabular-nums">{book.progress}%</span>
        </div>
      </div>

      <ArrowRight size={16} strokeWidth={1.5} className="text-[#9B9B8E] shrink-0" />
    </motion.button>
  );
}

function RecentExcerptCard({ excerpt, onClick }: { excerpt: Excerpt; onClick: () => void }) {
  const bookTitle = excerpt.bookTitle || '未知书籍';

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-[#F0F0F0] rounded-[10px] p-4 border border-[#E2E0D8] text-left hover:shadow-[0_4px_12px_rgba(44,44,44,0.05)] transition-all duration-300 w-full"
    >
      <div className="flex items-start gap-2">
        <Quote size={14} strokeWidth={1.5} className="text-[#5B7E71]/40 shrink-0 mt-0.5" />
        <p className="text-[13px] leading-[1.6] text-[#2C2C2C] line-clamp-3 flex-1">
          {excerpt.content}
        </p>
      </div>
      {excerpt.thought && (
        <p className="text-[12px] text-[#6B6B6B] mt-2 pl-5 line-clamp-2 italic">
          {excerpt.thought}
        </p>
      )}
      <div className="flex items-center gap-2 mt-3 pl-5">
        <span className="text-[11px] text-[#5B7E71] font-medium">{bookTitle}</span>
        <span className="text-[11px] text-[#9B9B8E]">·</span>
        <span className="text-[11px] text-[#9B9B8E]">
          {new Date(excerpt.createdAt).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </motion.button>
  );
}

function QuickAction({
  label,
  icon: Icon,
  color,
  bg,
  onClick,
}: {
  label: string;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex flex-col items-center gap-2 py-3"
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center transition-shadow duration-300',
          bg
        )}
      >
        <Icon size={22} strokeWidth={1.5} className={color} />
      </div>
      <span className="text-[12px] text-[#6B6B6B] font-medium">{label}</span>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    initializeData();
  }, []);

  const greeting = useMemo(() => getGreeting(), []);
  const stats = useMemo(() => getReadingStats(), []);
  const currentlyReading = useMemo(() => getCurrentlyReading(), []);
  const recentExcerpts = useMemo(() => getRecentExcerpts(4), []);
  const allBooks = useMemo(() => getBooks(), []);

  // Random "did you know" based on book count
  const funFact = useMemo(() => {
    const facts = [
      `你的书架上已有 ${stats.totalBooks} 本书`,
      `已记录 ${stats.totalExcerpts} 条精彩摘录`,
      `写了 ${stats.totalEssays} 篇随笔`,
      `还有 ${stats.preludeCount} 本书在序曲中等待`,
    ];
    return facts[Math.floor(Math.random() * facts.length)];
  }, [stats]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[900px]"
    >
      {/* ── Greeting ── */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1
          className="text-[28px] leading-[1.25] font-bold text-[#2C2C2C]"
          style={{
            fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
          }}
        >
          {greeting.text}
        </h1>
        <p className="text-[14px] text-[#6B6B6B]">{greeting.subtext}</p>
      </motion.div>

      {/* ── Quick Stats ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill
          label="在读"
          value={stats.currentlyReading}
          icon={BookOpen}
          color="text-[#5B7E71]"
          bg="bg-[#5B7E71]/10"
          onClick={() => navigate('/bookshelf')}
        />
        <StatPill
          label="已读完"
          value={stats.finaleCount}
          icon={BookMarked}
          color="text-[#7BAE7F]"
          bg="bg-[#7BAE7F]/10"
          onClick={() => navigate('/bookshelf')}
        />
        <StatPill
          label="摘录"
          value={stats.totalExcerpts}
          icon={Quote}
          color="text-[#6B8FAD]"
          bg="bg-[#6B8FAD]/10"
          onClick={() => navigate('/excerpts')}
        />
        <StatPill
          label="随笔"
          value={stats.totalEssays}
          icon={PenTool}
          color="text-[#A67C52]"
          bg="bg-[#A67C52]/10"
          onClick={() => navigate('/essays')}
        />
      </motion.div>

      {/* ── Currently Reading ── */}
      {currentlyReading.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5B7E71] animate-pulse" />
              <h2
                className="text-[16px] font-semibold text-[#2C2C2C]"
                style={{
                  fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
                }}
              >
                行板中...
              </h2>
            </div>
            <button
              onClick={() => navigate('/bookshelf')}
              className="text-[12px] text-[#5B7E71] hover:text-[#4A6A5F] transition-colors flex items-center gap-1"
            >
              查看书架
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {currentlyReading.slice(0, 3).map((book) => (
              <CurrentlyReadingCard
                key={book.id}
                book={book}
                onClick={() => navigate('/bookshelf')}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent Excerpts ── */}
      {recentExcerpts.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-[16px] font-semibold text-[#2C2C2C]"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              最近摘录
            </h2>
            <button
              onClick={() => navigate('/excerpts')}
              className="text-[12px] text-[#5B7E71] hover:text-[#4A6A5F] transition-colors flex items-center gap-1"
            >
              查看全部
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentExcerpts.map((excerpt) => (
              <RecentExcerptCard
                key={excerpt.id}
                excerpt={excerpt}
                onClick={() => navigate('/excerpts')}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Fun Fact ── */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 bg-[#5B7E71]/5 rounded-[10px] px-4 py-3 border border-[#5B7E71]/10"
      >
        <Sparkles size={16} strokeWidth={1.5} className="text-[#5B7E71] shrink-0" />
        <span className="text-[13px] text-[#5B7E71]">{funFact}</span>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h2
          className="text-[16px] font-semibold text-[#2C2C2C]"
          style={{
            fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
          }}
        >
          快捷操作
        </h2>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction
            label="添加书籍"
            icon={BookOpen}
            color="text-[#5B7E71]"
            bg="bg-[#5B7E71]/10"
            onClick={() => navigate('/bookshelf')}
          />
          <QuickAction
            label="记录摘录"
            icon={Quote}
            color="text-[#6B8FAD]"
            bg="bg-[#6B8FAD]/10"
            onClick={() => navigate('/excerpts')}
          />
          <QuickAction
            label="写随笔"
            icon={PenTool}
            color="text-[#A67C52]"
            bg="bg-[#A67C52]/10"
            onClick={() => navigate('/essays')}
          />
          <QuickAction
            label="回响"
            icon={Clock}
            color="text-[#7BAE7F]"
            bg="bg-[#7BAE7F]/10"
            onClick={() => navigate('/echoes')}
          />
        </div>
      </motion.div>

      {/* ── Bookshelf Preview (top rated) ── */}
      {allBooks.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              className="text-[16px] font-semibold text-[#2C2C2C]"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              高分书单
            </h2>
            <button
              onClick={() => navigate('/bookshelf')}
              className="text-[12px] text-[#5B7E71] hover:text-[#4A6A5F] transition-colors flex items-center gap-1"
            >
              查看全部
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {allBooks
              .filter((b) => b.rating >= 4)
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 6)
              .map((book) => (
                <motion.button
                  key={book.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/bookshelf')}
                  className="flex-shrink-0 w-[140px] bg-[#F0F0F0] rounded-[10px] p-3 border border-[#E2E0D8] text-left hover:shadow-[0_4px_12px_rgba(44,44,44,0.06)] transition-all duration-300"
                >
                  <div className="w-full h-[80px] rounded-md bg-[#5B7E71]/10 flex items-center justify-center mb-2 border border-[#E2E0D8]">
                    <BookOpen size={24} strokeWidth={1.5} className="text-[#5B7E71]/40" />
                  </div>
                  <h3
                    className="text-[13px] font-semibold text-[#2C2C2C] truncate"
                    style={{
                      fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
                    }}
                  >
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-[#6B6B6B] truncate">{book.author}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={10}
                        strokeWidth={1.5}
                        className={
                          i < book.rating ? 'text-[#D4A574] fill-[#D4A574]' : 'text-[#E2E0D8]'
                        }
                      />
                    ))}
                  </div>
                </motion.button>
              ))}
          </div>
        </motion.div>
      )}

      {/* ── Empty state if no books ── */}
      {allBooks.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[#5B7E71]/10 flex items-center justify-center mb-4">
            <BookOpen size={28} strokeWidth={1.5} className="text-[#5B7E71]" />
          </div>
          <h3
            className="text-[16px] font-semibold text-[#2C2C2C] mb-2"
            style={{
              fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
            }}
          >
            书架还是空的
          </h3>
          <p className="text-[13px] text-[#6B6B6B] max-w-[260px]">
            开始添加你的第一本书，开启阅读之旅
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/bookshelf')}
            className="mt-4 px-5 py-2 rounded-lg bg-[#5B7E71] text-white text-[13px] font-medium hover:bg-[#4A6A5F] transition-colors"
          >
            去添加书籍
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}
