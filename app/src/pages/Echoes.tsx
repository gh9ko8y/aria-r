import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Quote,
  Sparkles,
} from 'lucide-react';
import { getExcerpts, getBooks, initMockDataIfEmpty } from '@/lib/storage';
import type { Excerpt, Book } from '@/types';

/* ------------------------------------------------------------------ */
/*  Color palette (inline, since index.css can't be modified)          */
/* ------------------------------------------------------------------ */
const C = {
  bgCream: '#F8F6F0',
  bgCard: '#F0F0F0',
  bgPaper: '#F5F4EE',
  textPrimary: '#2C2C2C',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B8E',
  accentMorandi: '#5B7E71',
  accentHaze: '#6B8FAD',
  accentWarm: '#A67C52',
  success: '#7BAE7F',
  borderSubtle: '#E2E0D8',
} as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateCN(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 30) return `${diffDays}天前`;
  if (diffDays < 90) return `${Math.floor(diffDays / 30)}个月前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
  if (diffDays < 730) return '1年前';
  return `${Math.floor(diffDays / 365)}年前`;
}

function getTimeGroup(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 30) return '最近30天';
  if (diffDays <= 90) return '3个月前';
  if (diffDays <= 180) return '6个月前';
  if (diffDays <= 365) return '1年前';
  return '更久以前';
}

function isSameMonthDay(d1: Date, d2: Date): boolean {
  return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

/* ------------------------------------------------------------------ */
/*  Animation constants                                                */
/* ------------------------------------------------------------------ */

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FeaturedEcho({
  excerpt,
  book,
}: {
  excerpt: Excerpt;
  book: Book | undefined;
}) {
  const [navOffset, setNavOffset] = useState(0);

  const date = new Date(excerpt.createdAt);
  const displayDate = new Date(date);
  displayDate.setDate(displayDate.getDate() + navOffset);

  return (
    <motion.div
      variants={staggerItem}
      className="w-full rounded-[16px] p-6 md:p-10 relative overflow-hidden"
      style={{
        background: `linear-gradient(to right, ${C.bgCard}, #F0EDE5)`,
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%221%22/%3E%3C/svg%3E")',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Card header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: C.accentWarm }} />
          <span
            className="text-lg font-medium"
            style={{
              fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
              color: C.accentWarm,
            }}
          >
            一年前的今天
          </span>
        </div>
        <span
          className="text-sm"
          style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}
        >
          {formatDateCN(displayDate)}
        </span>
      </div>

      {/* Large quote */}
      <div className="relative mb-6 z-10">
        <Quote
          className="absolute -top-3 -left-2 w-16 h-16 pointer-events-none select-none"
          style={{ color: C.accentMorandi, opacity: 0.15 }}
        />
        <p
          className="text-lg md:text-[19px] leading-relaxed pl-6 italic"
          style={{
            fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
            color: C.textPrimary,
            lineHeight: 1.7,
          }}
        >
          {excerpt.content}
        </p>
      </div>

      {/* Book attribution */}
      <div className="flex items-center gap-3 mb-4 pl-6 relative z-10">
        {book?.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-12 h-16 object-cover rounded-md shadow-sm"
          />
        ) : (
          <div
            className="w-12 h-16 rounded-md flex items-center justify-center"
            style={{ backgroundColor: C.borderSubtle }}
          >
            <BookOpen className="w-5 h-5" style={{ color: C.textMuted }} />
          </div>
        )}
        <div>
          <p
            className="text-base font-medium"
            style={{
              fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
              color: C.accentHaze,
            }}
          >
            《{excerpt.bookTitle}》
          </p>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            {excerpt.bookAuthor}
          </p>
        </div>
      </div>

      {/* Personal thought */}
      {excerpt.thought && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="ml-6 pl-4 py-2 border-l-2"
          style={{ borderColor: C.borderSubtle }}
        >
          <p className="text-sm" style={{ color: C.textSecondary }}>
            <span style={{ color: C.textMuted }}>当时的想法：</span>
            {excerpt.thought}
          </p>
        </motion.div>
      )}

      {/* Navigation arrows */}
      <div className="flex items-center justify-end gap-2 mt-6 relative z-10">
        <button
          onClick={() => setNavOffset((o) => o - 1)}
          className="p-2 rounded-full transition-colors hover:opacity-80"
          style={{ backgroundColor: 'rgba(91,126,113,0.1)' }}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: C.accentMorandi }} />
        </button>
        <button
          onClick={() => setNavOffset((o) => o + 1)}
          className="p-2 rounded-full transition-colors hover:opacity-80"
          style={{ backgroundColor: 'rgba(91,126,113,0.1)' }}
        >
          <ChevronRight className="w-4 h-4" style={{ color: C.accentMorandi }} />
        </button>
      </div>
    </motion.div>
  );
}

function EchoCard({
  excerpt,
  book,
  index,
}: {
  excerpt: Excerpt;
  book: Book | undefined;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      variants={staggerItem}
      custom={index}
      className="rounded-[10px] border cursor-pointer transition-shadow hover:shadow-md"
      style={{
        backgroundColor: C.bgCard,
        borderColor: C.borderSubtle,
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-4 flex items-start gap-4">
        {book?.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-10 h-14 object-cover rounded flex-shrink-0"
          />
        ) : (
          <div
            className="w-10 h-14 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: C.borderSubtle }}
          >
            <BookOpen className="w-4 h-4" style={{ color: C.textMuted }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1" style={{ color: C.accentHaze }}>
            《{excerpt.bookTitle}》
          </p>

          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{
              color: C.textPrimary,
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
            }}
          >
            {excerpt.content}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3" style={{ color: C.textMuted }} />
            <span
              className="text-xs"
              style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {formatRelativeTime(new Date(excerpt.createdAt))}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1"
        >
          <ChevronRight className="w-4 h-4" style={{ color: C.textMuted }} />
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div
                className="border-l-[3px] pl-4 py-2"
                style={{ borderColor: C.accentMorandi }}
              >
                <p
                  className="text-base leading-relaxed italic mb-2"
                  style={{
                    color: C.textPrimary,
                    fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
                    lineHeight: 1.7,
                  }}
                >
                  {excerpt.content}
                </p>
                {excerpt.thought && (
                  <p className="text-sm" style={{ color: C.textSecondary }}>
                    <span style={{ color: C.textMuted }}>想法：</span>
                    {excerpt.thought}
                  </p>
                )}
                {excerpt.page && (
                  <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                    第 {excerpt.page} 页
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RandomRecall({
  excerpts,
}: {
  excerpts: Excerpt[];
}) {
  const [randomExcerpt, setRandomExcerpt] = useState<Excerpt | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleRandom = useCallback(() => {
    if (excerpts.length === 0) return;
    setIsFlipping(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * excerpts.length);
      setRandomExcerpt(excerpts[idx]);
      setIsFlipping(false);
    }, 300);
  }, [excerpts]);

  return (
    <motion.div variants={staggerItem} className="w-full py-12 flex flex-col items-center">
      {/* Icon with orbit dots */}
      <div className="relative mb-4 flex items-center justify-center w-20 h-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0"
        >
          {[0, 120, 240].map((deg) => (
            <div
              key={deg}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: C.accentMorandi,
                opacity: 0.4,
                top: '50%',
                left: '50%',
                transform: `rotate(${deg}deg) translateX(36px) translate(-50%, -50%)`,
              }}
            />
          ))}
        </motion.div>
        <motion.div
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <RotateCcw className="w-8 h-8" style={{ color: C.accentMorandi }} />
        </motion.div>
      </div>

      <h3
        className="text-[22px] font-medium mb-1"
        style={{
          fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
          color: C.textPrimary,
        }}
      >
        随机回响
      </h3>
      <p className="text-[15px] mb-6" style={{ color: C.textSecondary }}>
        让时光带你去一个意想不到的段落
      </p>

      <motion.button
        whileHover={{ scale: 1.04, filter: 'brightness(1.08)' }}
        whileTap={{ scale: 0.96 }}
        onClick={handleRandom}
        className="flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all"
        style={{ backgroundColor: C.accentMorandi }}
      >
        <RotateCcw className="w-5 h-5" />
        随机一篇
      </motion.button>

      <AnimatePresence mode="wait">
        {randomExcerpt && !isFlipping && (
          <motion.div
            key={randomExcerpt.id}
            initial={{ opacity: 0, scale: 0.8, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
            className="mt-8 w-full max-w-lg rounded-[10px] border p-6"
            style={{
              backgroundColor: C.bgCard,
              borderColor: C.accentWarm,
              borderLeftWidth: '4px',
            }}
          >
            <p
              className="text-lg leading-relaxed italic mb-4"
              style={{
                fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
                color: C.textPrimary,
                lineHeight: 1.7,
              }}
            >
              {randomExcerpt.content}
            </p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: C.accentHaze }}>
                  《{randomExcerpt.bookTitle}》 — {randomExcerpt.bookAuthor}
                </p>
                <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                  {formatDateCN(new Date(randomExcerpt.createdAt))} ·{' '}
                  {formatRelativeTime(new Date(randomExcerpt.createdAt))}
                </p>
              </div>
              {randomExcerpt.thought && (
                <Sparkles
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: C.accentWarm, opacity: 0.6 }}
                />
              )}
            </div>

            {randomExcerpt.thought && (
              <p
                className="text-sm mt-3 pt-3 border-t"
                style={{ color: C.textSecondary, borderColor: C.borderSubtle }}
              >
                {randomExcerpt.thought}
              </p>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRandom();
              }}
              className="mt-4 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: C.accentMorandi }}
            >
              再来一篇 →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ReadingTimeline({ books }: { books: Book[] }) {
  const sortedBooks = useMemo(
    () =>
      [...books]
        .filter((b) => b.createdAt)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [books]
  );

  if (sortedBooks.length === 0) {
    return (
      <motion.div variants={staggerItem} className="text-center py-8">
        <p className="text-sm" style={{ color: C.textMuted }}>
          开始阅读后，时间线将自动形成
        </p>
      </motion.div>
    );
  }

  const statusColor: Record<string, string> = {
    prelude: C.accentHaze,
    andante: C.accentMorandi,
    finale: C.success,
  };

  const statusLabel: Record<string, string> = {
    prelude: '序曲',
    andante: '行板',
    finale: '终章',
  };

  return (
    <motion.div variants={staggerItem} className="w-full relative py-4">
      {/* Vertical line */}
      <div
        className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px]"
        style={{ backgroundColor: C.borderSubtle }}
      />

      <div className="space-y-8">
        {sortedBooks.map((book, i) => {
          const date = new Date(book.createdAt);
          const isLeft = i % 2 === 0;

          return (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: isLeft ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: easeOut }}
              className={`relative flex items-center gap-4 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              {/* Node */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10">
                <div
                  className="w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: statusColor[book.status] || C.textMuted,
                    borderColor: C.bgCream,
                  }}
                />
              </div>

              {/* Content */}
              <div
                className={`ml-10 md:ml-0 md:w-[calc(50%-24px)] ${
                  isLeft ? 'md:mr-auto md:text-right' : 'md:ml-auto md:text-left'
                }`}
              >
                <div
                  className="flex items-center gap-3 rounded-[10px] border p-3 inline-flex"
                  style={{
                    backgroundColor: C.bgCard,
                    borderColor: C.borderSubtle,
                    flexDirection: isLeft ? 'row-reverse' : 'row',
                  }}
                >
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-8 h-11 object-cover rounded"
                    />
                  ) : (
                    <div
                      className="w-8 h-11 rounded flex items-center justify-center"
                      style={{ backgroundColor: C.borderSubtle }}
                    >
                      <BookOpen className="w-3 h-3" style={{ color: C.textMuted }} />
                    </div>
                  )}
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{
                        fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
                        color: C.textPrimary,
                      }}
                    >
                      《{book.title}》
                    </p>
                    <div
                      className="flex items-center gap-2 mt-0.5"
                      style={{ flexDirection: isLeft ? 'row-reverse' : 'row' }}
                    >
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${statusColor[book.status]}1F`,
                          color: statusColor[book.status],
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '11px',
                        }}
                      >
                        {statusLabel[book.status]}
                      </span>
                      <span className="text-xs" style={{ color: C.textMuted }}>
                        {date.getFullYear()}年{date.getMonth() + 1}月
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function Echoes() {
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState('今天');

  useEffect(() => {
    initMockDataIfEmpty();
    setExcerpts(getExcerpts());
    setBooks(getBooks());
  }, []);

  const booksMap = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);

  const tabs = ['今天', '本周', '本月', '去年今日', '全部'];

  const filteredExcerpts = useMemo(() => {
    const now = new Date();
    return excerpts.filter((e) => {
      const d = new Date(e.createdAt);
      switch (activeTab) {
        case '今天':
          return (
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        case '本周': {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo && d <= now;
        }
        case '本月':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case '去年今日': {
          const lastYear = new Date(now);
          lastYear.setFullYear(lastYear.getFullYear() - 1);
          return isSameMonthDay(d, lastYear);
        }
        default:
          return true;
      }
    });
  }, [excerpts, activeTab]);

  const groupedExcerpts = useMemo(() => {
    const groups: Record<string, Excerpt[]> = {};
    const sorted = [...filteredExcerpts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (const e of sorted) {
      const group = getTimeGroup(new Date(e.createdAt));
      if (!groups[group]) groups[group] = [];
      groups[group].push(e);
    }
    return groups;
  }, [filteredExcerpts]);

  const featuredExcerpt = useMemo(() => {
    const now = new Date();
    return excerpts.find((e) => {
      const d = new Date(e.createdAt);
      const lastYear = new Date(now);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      return isSameMonthDay(d, lastYear);
    });
  }, [excerpts]);

  const allSortedExcerpts = useMemo(
    () => [...excerpts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [excerpts]
  );

  const hasData = excerpts.length > 0;

  return (
    <div className="min-h-[100dvh] px-6 md:px-10 pb-20" style={{ backgroundColor: C.bgCream }}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="pt-16 pb-8 max-w-3xl mx-auto"
      >
        <h1
          className="text-[28px] font-medium mb-2"
          style={{
            fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
            color: C.textPrimary,
          }}
        >
          回响
        </h1>
        <p
          className="text-[15px] italic"
          style={{ color: C.textSecondary, fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
        >
          过去的摘录，今日的回音
        </p>

        {/* Decorative wave */}
        <svg className="mt-4 opacity-20" width="120" height="16" viewBox="0 0 120 16" fill="none">
          <path
            d="M0 8 Q15 0, 30 8 T60 8 T90 8 T120 8"
            stroke={C.accentMorandi}
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Time Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeTab === tab ? 'rgba(91,126,113,0.12)' : 'transparent',
                color: activeTab === tab ? C.accentMorandi : C.textSecondary,
                fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="echoes-tab"
                  className="absolute inset-0 rounded-full border"
                  style={{ borderColor: C.accentMorandi }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {!hasData ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 max-w-lg mx-auto text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-6"
          >
            <Clock className="w-20 h-20" style={{ color: C.textMuted, opacity: 0.4 }} />
          </motion.div>
          <h3
            className="text-[18px] font-medium mb-2"
            style={{
              fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
              color: C.textPrimary,
            }}
          >
            还没有回响
          </h3>
          <p className="text-sm" style={{ color: C.textSecondary }}>
            记录更多摘录后，过去的文字会在这里与你重逢
          </p>
        </motion.div>
      ) : (
        /* Content */
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto space-y-10"
        >
          {/* Featured Echo */}
          {featuredExcerpt && activeTab === '今天' && (
            <FeaturedEcho excerpt={featuredExcerpt} book={booksMap.get(featuredExcerpt.bookId)} />
          )}

          {/* Daily Echo Stream */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="text-[22px] font-medium"
                style={{
                  fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
                  color: C.textPrimary,
                }}
              >
                {activeTab === '全部' ? '全部回响' : `${activeTab}回响`}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(107,143,173,0.12)',
                  color: C.accentHaze,
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                {filteredExcerpts.length}
              </span>
            </div>

            {Object.keys(groupedExcerpts).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedExcerpts).map(([group, items]) => (
                  <div key={group}>
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="text-xs font-medium uppercase tracking-wider"
                        style={{
                          color: C.textMuted,
                          fontFamily: 'JetBrains Mono, monospace',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {group}
                      </span>
                      <div className="flex-1 h-px" style={{ backgroundColor: C.borderSubtle }} />
                    </div>
                    <motion.div
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      {items.map((excerpt, idx) => (
                        <EchoCard
                          key={excerpt.id}
                          excerpt={excerpt}
                          book={booksMap.get(excerpt.bookId)}
                          index={idx}
                        />
                      ))}
                    </motion.div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-10 rounded-xl border"
                style={{ borderColor: C.borderSubtle, backgroundColor: C.bgCard }}
              >
                <p className="text-sm" style={{ color: C.textMuted }}>
                  此时间段暂无回响
                </p>
              </div>
            )}
          </div>

          {/* Random Recall */}
          <RandomRecall excerpts={allSortedExcerpts} />

          {/* Reading Timeline */}
          <div>
            <h2
              className="text-[22px] font-medium mb-6"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
                color: C.textPrimary,
              }}
            >
              阅读时间线
            </h2>
            <ReadingTimeline books={books} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
