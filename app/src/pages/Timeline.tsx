import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  PenLine,
  X,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, ReadingLog, Excerpt } from '@/types';
import {
  getBooks,
  getReadingLogs,
  getExcerpts,
  initializeData,
} from '@/lib/storage';

/* ──────────────────────────────────────────────
   Types & Constants
   ────────────────────────────────────────────── */

type ViewMode = 'day' | 'week' | 'month' | 'year';

const viewLabels: Record<ViewMode, string> = {
  day: '\u65e5',
  week: '\u5468',
  month: '\u6708',
  year: '\u5e74',
};

const statusMeta: Record<string, { fill: string; text: string; bg: string; label: string }> = {
  prelude: {
    fill: 'bg-[#6B8FAD]',
    text: 'text-[#6B8FAD]',
    bg: 'bg-[#6B8FAD]/12',
    label: 'Prelude',
  },
  andante: {
    fill: 'bg-[#5B7E71]',
    text: 'text-[#5B7E71]',
    bg: 'bg-[#5B7E71]/12',
    label: 'Andante',
  },
  finale: {
    fill: 'bg-[#7BAE7F]',
    text: 'text-[#7BAE7F]',
    bg: 'bg-[#7BAE7F]/12',
    label: 'Finale',
  },
};

/* ──────────────────────────────────────────────
   Date Utilities
   ────────────────────────────────────────────── */

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

function addYears(d: Date, n: number): Date {
  const r = new Date(d);
  r.setFullYear(r.getFullYear() + n);
  return r;
}

function weekStart(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  const diff = r.getDate() - day + (day === 0 ? -6 : 1);
  r.setDate(diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

function weekEnd(d: Date): Date {
  const s = weekStart(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function monthEnd(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function yearStart(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function yearEnd(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function formatDuration(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return '';
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0) return `${h}\u5c0f\u65f6${m > 0 ? `${m}\u5206\u949f` : ''}`;
  return `${m}\u5206\u949f`;
}

function booksInRange(books: Book[], r0: Date, r1: Date): Book[] {
  return books.filter((b) => {
    if (!b.startDate) return false;
    const s = new Date(b.startDate);
    const e = b.finishDate ? new Date(b.finishDate) : new Date();
    return s <= r1 && e >= r0;
  });
}

function logsForDate(logs: ReadingLog[], date: string): ReadingLog[] {
  return logs.filter((l) => l.date === date);
}

function excerptsForDate(excerpts: Excerpt[], date: string): Excerpt[] {
  return excerpts.filter((e) => e.createdAt.startsWith(date));
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function Timeline() {
  useEffect(() => {
    initializeData();
  }, []);

  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const allBooks = useMemo(() => getBooks(), []);
  const allLogs = useMemo(() => getReadingLogs(), []);
  const allExcerpts = useMemo(() => getExcerpts(), []);

  /* -- navigation -- */
  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      switch (viewMode) {
        case 'day': return addDays(d, -1);
        case 'week': return addDays(d, -7);
        case 'month': return addMonths(d, -1);
        case 'year': return addYears(d, -1);
      }
    });
  }, [viewMode]);

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      switch (viewMode) {
        case 'day': return addDays(d, 1);
        case 'week': return addDays(d, 7);
        case 'month': return addMonths(d, 1);
        case 'year': return addYears(d, 1);
      }
    });
  }, [viewMode]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  /* -- date range -- */
  const range = useMemo(() => {
    switch (viewMode) {
      case 'day': return { start: new Date(currentDate), end: new Date(currentDate) };
      case 'week': return { start: weekStart(currentDate), end: weekEnd(currentDate) };
      case 'month': return { start: monthStart(currentDate), end: monthEnd(currentDate) };
      case 'year': return { start: yearStart(currentDate), end: yearEnd(currentDate) };
    }
  }, [viewMode, currentDate]);

  /* -- title -- */
  const title = useMemo(() => {
    switch (viewMode) {
      case 'day':
        return `${currentDate.getFullYear()}\u5e74${currentDate.getMonth() + 1}\u6708${currentDate.getDate()}\u65e5`;
      case 'week': {
        const s = weekStart(currentDate);
        const e = weekEnd(currentDate);
        return `${s.getFullYear()}.${s.getMonth() + 1}.${s.getDate()} - ${e.getMonth() + 1}.${e.getDate()}`;
      }
      case 'month':
        return `${currentDate.getFullYear()}\u5e74${currentDate.getMonth() + 1}\u6708`;
      case 'year':
        return `${currentDate.getFullYear()}\u5e74`;
    }
  }, [viewMode, currentDate]);

  const activeBooks = useMemo(() => booksInRange(allBooks, range.start, range.end), [allBooks, range]);

  const dayLogs = useMemo(() => viewMode === 'day' ? logsForDate(allLogs, fmtDate(currentDate)) : [], [viewMode, currentDate, allLogs]);
  const dayExcerpts = useMemo(() => viewMode === 'day' ? excerptsForDate(allExcerpts, fmtDate(currentDate)) : [], [viewMode, currentDate, allExcerpts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-[28px] leading-[1.25] font-bold text-[#2C2C2C]"
          style={{ fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif' }}
        >
          阅读时间线
        </h1>
        <p className="text-[13px] leading-[1.55] text-[#6B6B6B] mt-1">
          追踪你的阅读足迹，回顾每一段与书相伴的时光
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#F0F0F0] rounded-[10px] p-4 border border-[#E2E0D8]">
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="p-2 rounded-lg hover:bg-[rgba(44,44,44,0.04)] transition-colors duration-200 text-[#6B6B6B]"
            aria-label="previous"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-[#5B7E71] bg-[#5B7E71]/10 hover:bg-[#5B7E71]/20 transition-colors duration-200"
          >
            今天
          </button>
          <button
            onClick={goNext}
            className="p-2 rounded-lg hover:bg-[rgba(44,44,44,0.04)] transition-colors duration-200 text-[#6B6B6B]"
            aria-label="next"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
          <h2
            className="ml-3 text-[18px] leading-[1.35] font-semibold text-[#2C2C2C]"
            style={{ fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            {title}
          </h2>
        </div>

        <div className="flex items-center bg-[#F8F6F0] rounded-lg p-1 border border-[#E2E0D8]">
          {(Object.keys(viewLabels) as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200',
                viewMode === mode
                  ? 'text-white shadow-sm'
                  : 'text-[#6B6B6B] hover:text-[#2C2C2C]'
              )}
              style={viewMode === mode ? { backgroundColor: '#5B7E71' } : {}}
            >
              {viewLabels[mode]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'day' ? (
          <DayView
            key="day-view"
            date={currentDate}
            logs={dayLogs}
            excerpts={dayExcerpts}
            books={allBooks}
          />
        ) : (
          <GanttView
            key={`${viewMode}-${fmtDate(currentDate)}`}
            viewMode={viewMode}
            dateRange={range}
            books={activeBooks}
            onBookClick={(book) => setSelectedBook(book)}
          />
        )}
      </AnimatePresence>

      {/* Book Detail Drawer */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailDrawer book={selectedBook} onClose={() => setSelectedBook(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Day View
   ────────────────────────────────────────────── */

function DayView({
  date,
  logs,
  excerpts,
  books,
}: {
  date: Date;
  logs: ReadingLog[];
  excerpts: Excerpt[];
  books: Book[];
}) {
  const dateStr = fmtDate(date);
  const isToday = dateStr === fmtDate(new Date());

  const logsWithBook = useMemo(
    () =>
      logs.map((log) => ({
        ...log,
        book: books.find((b) => b.id === log.bookId),
      })),
    [logs, books]
  );

  const excerptsWithBook = useMemo(
    () =>
      excerpts.map((excerpt) => ({
        ...excerpt,
        book: books.find((b) => b.id === excerpt.bookId),
      })),
    [excerpts, books]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="space-y-6"
    >
      {/* Day header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-[10px] bg-[#5B7E71]/10 flex items-center justify-center">
          <Calendar size={22} strokeWidth={1.5} className="text-[#5B7E71]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[18px] leading-[1.35] font-semibold text-[#2C2C2C]">
            {isToday ? '今天' : `${date.getMonth() + 1}月${date.getDate()}日`}
          </h3>
          <p className="text-[13px] text-[#6B6B6B]">
            {date.getFullYear()}年{date.getMonth() + 1}月{date.getDate()}日 {'周日一二三四五六'[date.getDay()]}
          </p>
        </div>
        {isToday && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-lg bg-[#5B7E71] text-white text-[13px] font-medium hover:bg-[#4D6B60] transition-colors duration-200 flex items-center gap-2 shrink-0"
          >
            <PenLine size={14} strokeWidth={1.5} />
            今天读到这里
          </motion.button>
        )}
      </div>

      {/* Reading logs */}
      {logsWithBook.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-[15px] font-semibold text-[#2C2C2C] flex items-center gap-2">
            <Clock size={16} strokeWidth={1.5} className="text-[#5B7E71]" />
            阅读记录
          </h4>
          <div className="grid gap-3">
            {logsWithBook.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.06,
                  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
                }}
                className="bg-[#F0F0F0] rounded-[10px] p-4 border border-[#E2E0D8] hover:shadow-[0_4px_12px_rgba(44,44,44,0.06)] transition-shadow duration-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        statusMeta[log.book?.status || 'andante'].fill
                      )}
                    />
                    <span className="text-[15px] font-medium text-[#2C2C2C] truncate">
                      {log.book?.title || '未知书籍'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#9B9B8E] font-mono tracking-wider shrink-0">
                    {log.startTime} - {log.endTime}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#6B6B6B]">
                  {log.startPage != null && log.endPage != null && (
                    <span>
                      第 {log.startPage}-{log.endPage} 页
                      {log.endPage > log.startPage
                        ? ` (${log.endPage - log.startPage} 页)`
                        : ''}
                    </span>
                  )}
                  <span>{formatDuration(log.startTime, log.endTime)}</span>
                </div>
                {log.note && (
                  <p className="mt-2 text-[13px] leading-[1.55] text-[#6B6B6B] bg-[#F8F6F0] rounded-lg p-3 border-l-[3px] border-[#5B7E71]">
                    {log.note}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyDay isToday={isToday} />
      )}

      {/* Excerpts */}
      {excerptsWithBook.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[15px] font-semibold text-[#2C2C2C] flex items-center gap-2">
            <FileText size={16} strokeWidth={1.5} className="text-[#6B8FAD]" />
            当日摘录
          </h4>
          <div className="grid gap-3">
            {excerptsWithBook.map((excerpt, i) => (
              <motion.div
                key={excerpt.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.06,
                  ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
                }}
                className="bg-[#F0F0F0] rounded-[10px] p-4 border border-[#E2E0D8] hover:shadow-[0_4px_12px_rgba(44,44,44,0.06)] transition-shadow duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} strokeWidth={1.5} className="text-[#6B8FAD]" />
                  <span className="text-[13px] text-[#6B8FAD] font-medium">
                    {excerpt.book?.title || '未知书籍'}
                  </span>
                  {excerpt.pageNumber && (
                    <span className="text-[11px] text-[#9B9B8E]">
                      第 {excerpt.pageNumber} 页
                    </span>
                  )}
                </div>
                <p
                  className="text-[15px] leading-[1.65] text-[#2C2C2C] italic"
                  style={{
                    fontFamily:
                      'Source Han Serif CN, "Songti SC", SimSun, serif',
                  }}
                >
                  「{excerpt.content}」
                </p>
                {excerpt.thought && (
                  <p className="mt-2 text-[13px] leading-[1.55] text-[#6B6B6B]">
                    {excerpt.thought}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EmptyDay({ isToday }: { isToday: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-full bg-[#F0F0F0] flex items-center justify-center mb-4"
      >
        <BookOpen size={32} strokeWidth={1} className="text-[#9B9B8E]" />
      </motion.div>
      <h4 className="text-[15px] font-medium text-[#6B6B6B] mb-1">
        {isToday ? '今天还没有阅读记录' : '这一天没有阅读记录'}
      </h4>
      <p className="text-[13px] text-[#9B9B8E]">
        {isToday ? '开始阅读，记录你的第一页吧' : '试试查看其他日期'}
      </p>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Gantt View
   ────────────────────────────────────────────── */

function GanttView({
  viewMode,
  dateRange,
  books,
  onBookClick,
}: {
  viewMode: ViewMode;
  dateRange: { start: Date; end: Date };
  books: Book[];
  onBookClick: (book: Book) => void;
}) {
  const totalMs = dateRange.end.getTime() - dateRange.start.getTime() + 1;

  const getBarGeometry = useCallback(
    (book: Book) => {
      if (!book.startDate) return null;
      const s = new Date(book.startDate);
      const e = book.finishDate ? new Date(book.finishDate) : new Date();

      const cs = s < dateRange.start ? dateRange.start : s;
      const ce = e > dateRange.end ? dateRange.end : e;

      const leftMs = cs.getTime() - dateRange.start.getTime();
      const widthMs = ce.getTime() - cs.getTime();

      return {
        left: `${(leftMs / totalMs) * 100}%`,
        width: `${Math.max((widthMs / totalMs) * 100, 0.5)}%`,
      };
    },
    [dateRange, totalMs]
  );

  const gridTicks = useMemo(() => {
    const ticks: { label: string; pos: number }[] = [];
    switch (viewMode) {
      case 'week':
        for (let i = 0; i < 7; i++) {
          const d = addDays(dateRange.start, i);
          ticks.push({
            label: `${d.getMonth() + 1}/${d.getDate()}`,
            pos: (i / 7) * 100,
          });
        }
        break;
      case 'month': {
        const dim = daysInMonth(dateRange.start);
        const step = dim > 28 ? 5 : 3;
        for (let i = 0; i < dim; i += step) {
          ticks.push({
            label: `${i + 1}日`,
            pos: (i / dim) * 100,
          });
        }
        break;
      }
      case 'year':
        for (let i = 0; i < 12; i++) {
          ticks.push({
            label: `${i + 1}月`,
            pos: (i / 12) * 100,
          });
        }
        break;
    }
    return ticks;
  }, [viewMode, dateRange]);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { andante: 0, finale: 1, prelude: 2 };
    return [...books].sort((a, b) => {
      const o = (order[a.status] ?? 0) - (order[b.status] ?? 0);
      if (o !== 0) return o;
      return (
        new Date(a.startDate || 0).getTime() -
        new Date(b.startDate || 0).getTime()
      );
    });
  }, [books]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="bg-[#F0F0F0] rounded-[10px] border border-[#E2E0D8] overflow-hidden"
    >
      {/* Tick header */}
      <div className="relative h-10 border-b border-[#E2E0D8] bg-[#F8F6F0]">
        {gridTicks.map((t, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-[#E2E0D8] flex items-center px-1"
            style={{ left: `${t.pos}%` }}
          >
            <span className="text-[11px] text-[#9B9B8E] whitespace-nowrap">{t.label}</span>
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="p-4 space-y-3">
        {sorted.length > 0 ? (
          sorted.map((book, idx) => {
            const geo = getBarGeometry(book);
            const meta = statusMeta[book.status];
            if (!geo) return null;

            return (
              <div key={book.id} className="flex items-center gap-3">
                {/* Title column */}
                <div className="w-28 sm:w-40 flex-shrink-0 text-right pr-1">
                  <span
                    className="text-[13px] text-[#2C2C2C] font-medium truncate block"
                    title={book.title}
                  >
                    {book.title}
                  </span>
                  <span className="text-[11px] text-[#9B9B8E]">{book.progress}%</span>
                </div>

                {/* Bar track */}
                <div className="flex-1 relative h-8 bg-[#E2E0D8]/40 rounded-full overflow-hidden">
                  {/* Vertical grid lines */}
                  {gridTicks.map((t, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 border-l border-[#E2E0D8]/50"
                      style={{ left: `${t.pos}%` }}
                    />
                  ))}

                  {/* Animated bar */}
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: geo.width, opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.07,
                      ease: 'easeOut',
                    }}
                    className={cn(
                      'absolute top-1 bottom-1 rounded-full cursor-pointer hover:brightness-95 transition-all duration-200',
                      meta.fill
                    )}
                    style={{ left: geo.left }}
                    onClick={() => onBookClick(book)}
                  >
                    {/* Inner fill — darker portion = read */}
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${book.progress}%`,
                        backgroundColor: 'rgba(255,255,255,0.35)',
                      }}
                    />
                  </motion.div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <BarChart3 size={32} strokeWidth={1} className="text-[#9B9B8E] mb-3" />
            <p className="text-[13px] text-[#6B6B6B]">此时间段内没有阅读记录</p>
            <p className="text-[11px] text-[#9B9B8E] mt-1">尝试切换到其他时间范围</p>
          </div>
        )}
      </div>

      {/* Legend */}
      {sorted.length > 0 && (
        <div className="px-4 pb-4 pt-1 flex items-center gap-5 justify-center">
          {Object.entries(statusMeta).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded-full', meta.fill)} />
              <span className="text-[11px] text-[#6B6B6B]">{meta.label}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Book Detail Drawer
   ────────────────────────────────────────────── */

function BookDetailDrawer({ book, onClose }: { book: Book; onClose: () => void }) {
  const meta = statusMeta[book.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[rgba(44,44,44,0.3)] backdrop-blur-sm" />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full sm:max-w-[560px] sm:rounded-[16px] rounded-t-[16px] bg-[#F8F6F0] max-h-[80vh] overflow-y-auto shadow-[0_24px_48px_rgba(44,44,44,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="text-[22px] leading-[1.3] font-bold text-[#2C2C2C]"
                style={{
                  fontFamily:
                    'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
                }}
              >
                {book.title}
              </h3>
              <p className="text-[13px] text-[#6B6B6B] mt-1">{book.author}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[rgba(44,44,44,0.04)] transition-colors shrink-0"
              aria-label="close"
            >
              <X size={20} strokeWidth={1.5} className="text-[#6B6B6B]" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wider',
                meta.bg,
                meta.text
              )}
            >
              {meta.label}
            </span>
            {book.startDate && (
              <span className="text-[11px] text-[#9B9B8E]">
                始于 {new Date(book.startDate).toLocaleDateString('zh-CN')}
              </span>
            )}
            {book.finishDate && (
              <span className="text-[11px] text-[#9B9B8E]">
                完于 {new Date(book.finishDate).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-[#6B6B6B]">阅读进度</span>
              <span className="text-[11px] text-[#5B7E71] font-medium">
                {book.progress}%
              </span>
            </div>
            <div className="h-2 bg-[#E2E0D8] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${book.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-[#5B7E71] rounded-full"
              />
            </div>
          </div>

          {/* Page count */}
          <div className="mt-4 flex items-center gap-4 text-[13px] text-[#6B6B6B]">
            <span>共 {book.pageCount} 页</span>
            {book.currentPage != null && (
              <span>
                读到第 {book.currentPage} 页
                {book.pageCount > 0
                  ? ` (剩余 ${book.pageCount - book.currentPage} 页)`
                  : ''}
              </span>
            )}
          </div>

          {book.review && (
            <div className="mt-4 p-3 bg-[#F0F0F0] rounded-lg border-l-[3px] border-[#5B7E71]">
              <p className="text-[13px] leading-[1.55] text-[#6B6B6B]">
                {book.review}
              </p>
            </div>
          )}

          {book.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {book.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[11px] text-[#6B8FAD] bg-[#6B8FAD]/10"
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
