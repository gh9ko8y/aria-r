import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  Check,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ListOrdered,
  Calendar,
  X,
} from 'lucide-react';
import { getBooks, saveBooks, getReadingGoals, saveReadingGoals, initMockDataIfEmpty } from '@/lib/storage';
import type { Book, ReadingGoal, ReadingStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/* ------------------------------------------------------------------ */
/*  Color palette                                                      */
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

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

function formatDateCN(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/*  SVG Progress Ring                                                  */
/* ------------------------------------------------------------------ */

function ProgressRing({
  progress,
  size = 40,
  strokeWidth = 3,
  color = C.accentMorandi,
  label,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={C.borderSubtle}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: easeOut, delay: 0.2 }}
        />
      </svg>
      {label && (
        <span
          className="absolute text-xs font-medium"
          style={{ color: C.textPrimary, fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: ReadingStatus }) {
  const config: Record<ReadingStatus, { label: string; color: string; bg: string }> = {
    prelude: { label: '序曲', color: C.accentHaze, bg: 'rgba(107,143,173,0.12)' },
    andante: { label: '行板', color: C.accentMorandi, bg: 'rgba(91,126,113,0.12)' },
    finale: { label: '终章', color: C.success, bg: 'rgba(123,174,127,0.12)' },
  };
  const c = config[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
      style={{
        backgroundColor: c.bg,
        color: c.color,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
      }}
    >
      {c.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Goal Summary Card                                                  */
/* ------------------------------------------------------------------ */

function GoalSummaryCard({
  title,
  value,
  subtitle,
  color,
  progress,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  progress: number;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="flex-1 min-w-[140px] rounded-[10px] border p-4 flex items-center gap-4"
      style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
    >
      <ProgressRing progress={progress} size={44} strokeWidth={3} color={color} />
      <div>
        <p className="text-xs mb-0.5" style={{ color: C.textMuted }}>{title}</p>
        <p className="text-lg font-semibold" style={{ color: C.textPrimary }}>{value}</p>
        <p className="text-xs" style={{ color: C.textSecondary }}>{subtitle}</p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Goal Item                                                          */
/* ------------------------------------------------------------------ */

function GoalItem({
  goal,
  onToggle,
  onDelete,
}: {
  goal: ReadingGoal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const pct = Math.round((goal.current / goal.target) * 100);

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-[10px] border p-4 group"
      style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(goal.id)}
          className="mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
          style={{
            borderColor: goal.completed ? C.accentMorandi : C.borderSubtle,
            backgroundColor: goal.completed ? C.accentMorandi : 'transparent',
          }}
        >
          {goal.completed && <Check className="w-3 h-3 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-medium"
              style={{
                color: goal.completed ? C.textMuted : C.textPrimary,
                textDecoration: goal.completed ? 'line-through' : 'none',
              }}
            >
              {goal.title}
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(107,143,173,0.1)',
                color: C.accentHaze,
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
              }}
            >
              {goal.target} {goal.unit} / {goal.deadline ? formatDateCN(goal.deadline).slice(0, 7) : ''}
            </span>
          </div>

          {!goal.completed && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderSubtle }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: C.accentMorandi }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: easeOut }}
                  />
                </div>
                <span
                  className="text-xs flex-shrink-0"
                  style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {pct}%
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 mt-1.5">
            <Calendar className="w-3 h-3" style={{ color: C.textMuted }} />
            <span className="text-xs" style={{ color: C.textMuted }}>截止 {formatDateCN(goal.deadline)}</span>
          </div>
        </div>

        <button
          onClick={() => onDelete(goal.id)}
          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: C.textMuted }}
          title="删除目标"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Queue Item                                                         */
/* ------------------------------------------------------------------ */

function QueueItem({
  book,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onStartReading,
  onRemove,
}: {
  book: Book;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onStartReading: () => void;
  onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      variants={staggerItem}
      className="group rounded-[10px] border p-3 md:p-4 flex items-center gap-3"
      style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
    >
      {/* Number */}
      <span
        className="w-6 text-center flex-shrink-0"
        style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}
      >
        {index + 1}
      </span>

      {/* Up/Down buttons */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-0.5 rounded hover:bg-black/5 disabled:opacity-30 transition-opacity"
        >
          <ArrowUp className="w-3 h-3" style={{ color: C.textMuted }} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 rounded hover:bg-black/5 disabled:opacity-30 transition-opacity"
        >
          <ArrowDown className="w-3 h-3" style={{ color: C.textMuted }} />
        </button>
      </div>

      {/* Cover */}
      {book.cover ? (
        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded flex-shrink-0" />
      ) : (
        <div className="w-10 h-14 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.borderSubtle }}>
          <BookOpen className="w-4 h-4" style={{ color: C.textMuted }} />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: C.textPrimary, fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif' }}>
          《{book.title}》
        </p>
        <p className="text-xs" style={{ color: C.textSecondary }}>{book.author}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onStartReading}
          className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
          style={{ backgroundColor: 'rgba(91,126,113,0.12)', color: C.accentMorandi }}
        >
          开始
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md transition-colors"
          style={{ color: C.textMuted }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */

export default function Playlist() {
  const [books, setBooks] = useState<Book[]>([]);
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalUnit, setGoalUnit] = useState('本');
  const [goalDeadline, setGoalDeadline] = useState('');

  useEffect(() => {
    initMockDataIfEmpty();
    setBooks(getBooks());
    setGoals(getReadingGoals());
  }, []);

  const readingBooks = useMemo(
    () => books.filter((b) => b.status === 'andante'),
    [books]
  );

  const preludeBooks = useMemo(
    () => books.filter((b) => b.status === 'prelude'),
    [books]
  );

  const finishedThisMonth = useMemo(() => {
    const now = new Date();
    return books.filter((b) => {
      if (b.status !== 'finale' || !b.finishDate) return false;
      const d = new Date(b.finishDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [books]);

  const stats = useMemo(() => {
    const finished = books.filter((b) => b.status === 'finale').length;
    const inProgress = readingBooks.length;
    const totalPages = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);
    return { finished, inProgress, totalPages };
  }, [books, readingBooks]);

  const handleAddGoal = () => {
    if (!goalTitle.trim() || !goalTarget.trim()) return;

    const newGoal: ReadingGoal = {
      id: `goal-${Date.now()}`,
      title: goalTitle.trim(),
      target: parseInt(goalTarget),
      current: 0,
      unit: goalUnit,
      deadline: goalDeadline,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const next = [...goals, newGoal];
    setGoals(next);
    saveReadingGoals(next);

    setGoalTitle('');
    setGoalTarget('');
    setGoalUnit('本');
    setGoalDeadline('');
    setShowGoalForm(false);
  };

  const handleToggleGoal = (id: string) => {
    const next = goals.map((g) =>
      g.id === id ? { ...g, completed: !g.completed } : g
    );
    setGoals(next);
    saveReadingGoals(next);
  };

  const handleDeleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    saveReadingGoals(next);
  };

  const handleStartReading = (bookId: string) => {
    const next = books.map((b) =>
      b.id === bookId ? { ...b, status: 'andante' as ReadingStatus, startDate: new Date().toISOString() } : b
    );
    setBooks(next);
    saveBooks(next);
  };

  const handleMoveQueue = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= preludeBooks.length) return;

    const queue = [...preludeBooks];
    const [moved] = queue.splice(index, 1);
    queue.splice(newIndex, 0, moved);

    const reordered = queue.map((b, i) => ({ ...b, order: i }));
    const next = books.map((b) => {
      const reorderedBook = reordered.find((rb) => rb.id === b.id);
      return reorderedBook || b;
    });

    setBooks(next);
    saveBooks(next);
  };

  return (
    <div className="min-h-[100dvh] px-6 md:px-10 pb-20" style={{ backgroundColor: C.bgCream }}>
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className="pt-16 pb-8"
        >
          <h1
            className="text-[28px] font-medium mb-2"
            style={{
              fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
              color: C.textPrimary,
            }}
          >
            阅读清单
          </h1>
          <p
            className="text-[15px]"
            style={{
              color: C.textSecondary,
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
            }}
          >
            当前在读、待读队列与阅读目标
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap gap-3 mb-8"
        >
          <GoalSummaryCard
            title="本月完成"
            value={`${finishedThisMonth.length} 本`}
            subtitle={`目标 ${goals.filter(g => !g.completed).reduce((s, g) => s + g.target, 0)} 本`}
            color={C.success}
            progress={finishedThisMonth.length * 20}
          />
          <GoalSummaryCard
            title="正在阅读"
            value={`${stats.inProgress} 本`}
            subtitle="进行中"
            color={C.accentMorandi}
            progress={stats.inProgress * 25}
          />
          <GoalSummaryCard
            title="累计页数"
            value={`${stats.totalPages}`}
            subtitle="已读页数"
            color={C.accentWarm}
            progress={Math.min(stats.totalPages / 10, 100)}
          />
        </motion.div>

        {/* Currently Reading */}
        {readingBooks.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >
            <h2
              className="text-[18px] font-medium mb-4"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
                color: C.textPrimary,
              }}
            >
              正在阅读
            </h2>
            <div className="space-y-3">
              {readingBooks.map((book) => {
                const progress = book.pageCount
                  ? Math.round(((book.currentPage || 0) / book.pageCount) * 100)
                  : 0;

                return (
                  <motion.div
                    key={book.id}
                    variants={staggerItem}
                    className="rounded-[10px] border p-4"
                    style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
                  >
                    <div className="flex items-start gap-4">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-12 h-16 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div
                          className="w-12 h-16 rounded flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: C.borderSubtle }}
                        >
                          <BookOpen className="w-5 h-5" style={{ color: C.textMuted }} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className="text-sm font-medium"
                            style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
                          >
                            《{book.title}》
                          </p>
                          <StatusBadge status="andante" />
                        </div>
                        <p className="text-xs mb-2" style={{ color: C.textSecondary }}>{book.author}</p>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: C.borderSubtle }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: C.accentMorandi }}
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, ease: easeOut }}
                            />
                          </div>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace' }}
                          >
                            {progress}%
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: C.textMuted }}>
                          {book.currentPage || 0} / {book.pageCount} 页
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Reading Queue */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[18px] font-medium"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
                color: C.textPrimary,
              }}
            >
              待读队列
            </h2>
            <span className="text-xs" style={{ color: C.textMuted }}>
              {preludeBooks.length} 本
            </span>
          </div>

          {preludeBooks.length > 0 ? (
            <div className="space-y-2">
              {preludeBooks.map((book, i) => (
                <QueueItem
                  key={book.id}
                  book={book}
                  index={i}
                  total={preludeBooks.length}
                  onMoveUp={() => handleMoveQueue(i, 'up')}
                  onMoveDown={() => handleMoveQueue(i, 'down')}
                  onStartReading={() => handleStartReading(book.id)}
                  onRemove={() => {}}
                />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerItem}
              className="text-center py-8 rounded-[10px] border"
              style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
            >
              <ListOrdered className="w-8 h-8 mx-auto mb-2" style={{ color: C.textMuted }} />
              <p className="text-sm" style={{ color: C.textSecondary }}>
                待读队列为空，从书架添加书籍
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Reading Goals */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[18px] font-medium"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif',
                color: C.textPrimary,
              }}
            >
              阅读目标
            </h2>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{ backgroundColor: 'rgba(91,126,113,0.12)', color: C.accentMorandi }}
            >
              {showGoalForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {showGoalForm ? '取消' : '添加'}
            </button>
          </div>

          {/* Goal Form */}
          <AnimatePresence>
            {showGoalForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-4"
              >
                <div
                  className="rounded-[10px] border p-4 space-y-3"
                  style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
                >
                  <Input
                    placeholder="目标名称，如：每月读3本书"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="bg-[#F8F6F0] border-[#E2E0D8] rounded-[8px]"
                  />
                  <div className="flex gap-3">
                    <Input
                      placeholder="数量"
                      type="number"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-24 bg-[#F8F6F0] border-[#E2E0D8] rounded-[8px]"
                    />
                    <select
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      className="px-3 py-2 rounded-[8px] text-sm bg-[#F8F6F0] border border-[#E2E0D8] outline-none"
                      style={{ color: C.textPrimary }}
                    >
                      <option value="本">本</option>
                      <option value="页">页</option>
                      <option value="章">章</option>
                      <option value="小时">小时</option>
                    </select>
                    <Input
                      placeholder="截止日期"
                      type="date"
                      value={goalDeadline}
                      onChange={(e) => setGoalDeadline(e.target.value)}
                      className="flex-1 bg-[#F8F6F0] border-[#E2E0D8] rounded-[8px]"
                    />
                  </div>
                  <Button
                    onClick={handleAddGoal}
                    disabled={!goalTitle.trim() || !goalTarget.trim()}
                    className="w-full"
                    style={{ backgroundColor: C.accentMorandi }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    保存目标
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Goal List */}
          <div className="space-y-2">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  onToggle={handleToggleGoal}
                  onDelete={handleDeleteGoal}
                />
              ))
            ) : (
              <motion.div
                variants={staggerItem}
                className="text-center py-8 rounded-[10px] border"
                style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
              >
                <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: C.textMuted }} />
                <p className="text-sm" style={{ color: C.textSecondary }}>
                  还没有阅读目标，添加一个吧
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
