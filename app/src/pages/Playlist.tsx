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
          className="p-0.5 rounded disabled:opacity-20 transition-opacity hover:opacity-70"
          style={{ color: C.textMuted }}
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-0.5 rounded disabled:opacity-20 transition-opacity hover:opacity-70"
          style={{ color: C.textMuted }}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cover */}
      {book.cover ? (
        <img src={book.cover} alt={book.title} className="w-10 h-14 object-cover rounded-md flex-shrink-0 shadow-sm" />
      ) : (
        <div className="w-10 h-14 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: C.borderSubtle }}>
          <BookOpen className="w-4 h-4" style={{ color: C.textMuted }} />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
        >
          《{book.title}》
        </p>
        <p className="text-xs" style={{ color: C.textSecondary }}>{book.author}</p>
        <div className="flex items-center gap-2 mt-1">
          <StatusBadge status={book.status} />
          <span
            className="text-xs"
            style={{ color: C.textMuted, fontFamily: 'JetBrains Mono, monospace', fontSize: '10px' }}
          >
            {formatDateCN(book.createdAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onStartReading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-105"
          style={{ backgroundColor: C.accentMorandi, color: '#fff' }}
        >
          开始阅读
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md transition-opacity hover:opacity-70"
          style={{ color: C.textMuted }}
          title="移除"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  TBR Book Card                                                      */
/* ------------------------------------------------------------------ */

function TBRCard({
  book,
  inQueue,
  onAddToQueue,
}: {
  book: Book;
  inQueue: boolean;
  onAddToQueue: () => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -2 }}
      className="rounded-[10px] border overflow-hidden transition-shadow hover:shadow-lg"
      style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: C.borderSubtle }}>
            <BookOpen className="w-8 h-8" style={{ color: C.textMuted }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-end justify-center pb-3 opacity-0 hover:opacity-100">
          {inQueue ? (
            <span
              className="text-xs px-3 py-1.5 rounded-full bg-white/90 font-medium"
              style={{ color: C.accentMorandi }}
            >
              已在队列
            </span>
          ) : (
            <button
              onClick={onAddToQueue}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: '#fff', color: C.accentMorandi }}
            >
              <Plus className="w-3 h-3" />
              加入队列
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <p
          className="text-sm font-medium truncate"
          style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
        >
          《{book.title}》
        </p>
        <p
          className="text-xs truncate mt-0.5"
          style={{ color: C.textSecondary, fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
        >
          {book.author}
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  New Goal Form                                                      */
/* ------------------------------------------------------------------ */

function NewGoalForm({ onCreate, onCancel }: { onCreate: (goal: Omit<ReadingGoal, 'id' | 'createdAt'>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState<'本' | '页' | '小时'>('本');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target || !deadline) return;
    onCreate({ title, target: Number(target), unit, current: 0, deadline, completed: false });
    onCancel();
  };

  return (
    <motion.form
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: easeOut }}
      onSubmit={handleSubmit}
      className="overflow-hidden"
    >
      <div className="rounded-[10px] border p-4 space-y-3" style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}>
        <Input
          placeholder="目标名称"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm"
          style={{ backgroundColor: C.bgPaper }}
        />
        <div className="flex gap-3">
          <Input
            type="number"
            placeholder="目标数量"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="text-sm flex-1"
            style={{ backgroundColor: C.bgPaper }}
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as '本' | '页' | '小时')}
            className="rounded-md border px-3 text-sm"
            style={{ backgroundColor: C.bgPaper, borderColor: C.borderSubtle, color: C.textPrimary }}
          >
            <option value="本">本</option>
            <option value="页">页</option>
            <option value="小时">小时</option>
          </select>
        </div>
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="text-sm"
          style={{ backgroundColor: C.bgPaper }}
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" style={{ backgroundColor: C.accentMorandi }}>创建</Button>
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>取消</Button>
        </div>
      </div>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Playlist Page                                                 */
/* ------------------------------------------------------------------ */

export default function Playlist() {
  const [books, setBooks] = useState<Book[]>([]);
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [showCompletedGoals, setShowCompletedGoals] = useState(false);
  const [tbrFilter, setTbrFilter] = useState('全部');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    initMockDataIfEmpty();
    refreshData();
  }, []);

  const refreshData = () => {
    setBooks(getBooks());
    setGoals(getReadingGoals());
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ---- Derived state ---- */
  const preludeBooks = useMemo(() => books.filter((b) => b.status === 'prelude'), [books]);
  const readingBooks = useMemo(() => books.filter((b) => b.status === 'andante'), [books]);

  const queueBooks = useMemo(() => {
    const withOrder = preludeBooks
      .filter((b) => b.readingOrder !== undefined)
      .sort((a, b) => (a.readingOrder ?? 0) - (b.readingOrder ?? 0));
    return withOrder;
  }, [preludeBooks]);

  const tbrBooks = useMemo(() => {
    const withoutOrder = preludeBooks.filter((b) => b.readingOrder === undefined);
    if (tbrFilter === '全部') return withoutOrder;
    return withoutOrder.filter((b) => b.genre === tbrFilter);
  }, [preludeBooks, tbrFilter]);

  const activeGoals = useMemo(() => goals.filter((g) => !g.completed), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.completed), [goals]);
  const queueBookIds = useMemo(() => new Set(queueBooks.map((b) => b.id)), [queueBooks]);

  /* ---- Stats ---- */
  const yearGoal = goals.find((g) => g.title.includes('年') && !g.completed);
  const monthGoal = goals.find((g) => g.title.includes('月') && !g.completed);

  /* ---- Actions ---- */
  const handleToggleGoal = (id: string) => {
    const updated = goals.map((g) =>
      g.id === id
        ? { ...g, completed: !g.completed, completedAt: !g.completed ? new Date().toISOString() : undefined }
        : g
    );
    setGoals(updated);
    saveReadingGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    saveReadingGoals(updated);
  };

  const handleCreateGoal = (data: Omit<ReadingGoal, 'id' | 'createdAt'>) => {
    const newGoal: ReadingGoal = { ...data, id: `goal_${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveReadingGoals(updated);
  };

  const handleMoveQueueItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === queueBooks.length - 1) return;

    const newQueue = [...queueBooks];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    [newQueue[index], newQueue[swapIdx]] = [newQueue[swapIdx], newQueue[index]];

    const updatedBooks = books.map((b) => {
      const queueIdx = newQueue.findIndex((q) => q.id === b.id);
      if (queueIdx >= 0) return { ...b, readingOrder: queueIdx + 1 };
      return b;
    });

    setBooks(updatedBooks);
    saveBooks(updatedBooks);
  };

  const handleStartReading = (bookId: string) => {
    const updated = books.map((b) =>
      b.id === bookId
        ? { ...b, status: 'andante' as ReadingStatus, readingOrder: undefined, updatedAt: new Date().toISOString() }
        : b
    );
    setBooks(updated);
    saveBooks(updated);
    const book = books.find((b) => b.id === bookId);
    showToast(`《${book?.title}》已加入行板`);
  };

  const handleAddToQueue = (bookId: string) => {
    const maxOrder = Math.max(0, ...queueBooks.map((b) => b.readingOrder ?? 0));
    const updated = books.map((b) => (b.id === bookId ? { ...b, readingOrder: maxOrder + 1 } : b));
    setBooks(updated);
    saveBooks(updated);
    showToast('已加入阅读队列');
  };

  const handleRemoveFromQueue = (bookId: string) => {
    const updated = books.map((b) => (b.id === bookId ? { ...b, readingOrder: undefined } : b));
    setBooks(updated);
    saveBooks(updated);
  };

  const genreFilters = ['全部', '小说', '非虚构', '其他'];

  return (
    <div className="min-h-[100dvh] px-6 md:px-10 pb-20" style={{ backgroundColor: C.bgCream }}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium"
            style={{ backgroundColor: C.bgCard, color: C.textPrimary, border: `1px solid ${C.borderSubtle}` }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: easeOut }}
        className="pt-16 pb-8 max-w-5xl mx-auto"
      >
        <h1
          className="text-[28px] font-medium mb-2"
          style={{ fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif', color: C.textPrimary }}
        >
          曲目清单
        </h1>
        <p className="text-[15px]" style={{ color: C.textSecondary }}>
          下一段阅读旅程，从这里开始
        </p>

        {/* Goal Summary Cards */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-wrap gap-4 mt-6">
          <GoalSummaryCard
            title="本年目标"
            value={`${yearGoal?.current ?? 0} / ${yearGoal?.target ?? 0} 本`}
            subtitle={`已读 ${yearGoal?.current ?? 0} 本`}
            color={C.accentMorandi}
            progress={yearGoal ? (yearGoal.current / yearGoal.target) * 100 : 0}
          />
          <GoalSummaryCard
            title="本月目标"
            value={`${monthGoal?.current ?? 0} / ${monthGoal?.target ?? 0} 本`}
            subtitle={`已读 ${monthGoal?.current ?? 0} 本`}
            color={C.accentHaze}
            progress={monthGoal ? (monthGoal.current / monthGoal.target) * 100 : 0}
          />
          <GoalSummaryCard
            title="当前队列"
            value={`${queueBooks.length} 本`}
            subtitle="待读"
            color={C.accentWarm}
            progress={queueBooks.length > 0 ? 100 : 0}
          />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-12">
        {/* Section 2: Reading Goals */}
        <motion.section variants={staggerItem}>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-[22px] font-medium"
              style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
            >
              阅读目标
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewGoal((v) => !v)}
              className="flex items-center gap-1"
              style={{ borderColor: C.accentHaze, color: C.accentHaze }}
            >
              <Plus className="w-3.5 h-3.5" />
              新建目标
            </Button>
          </div>

          <AnimatePresence>
            {showNewGoal && (
              <div className="mb-4">
                <NewGoalForm onCreate={handleCreateGoal} onCancel={() => setShowNewGoal(false)} />
              </div>
            )}
          </AnimatePresence>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            {activeGoals.map((goal) => (
              <GoalItem key={goal.id} goal={goal} onToggle={handleToggleGoal} onDelete={handleDeleteGoal} />
            ))}
          </motion.div>
        </motion.section>

        {/* Section 3: Current Queue */}
        {queueBooks.length > 0 && (
          <motion.section variants={staggerItem}>
            <div className="mb-4">
              <h2
                className="text-[22px] font-medium"
                style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
              >
                阅读队列
              </h2>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                按优先级排列，下一本读什么？
              </p>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
              <AnimatePresence>
                {queueBooks.map((book, idx) => (
                  <QueueItem
                    key={book.id}
                    book={book}
                    index={idx}
                    total={queueBooks.length}
                    onMoveUp={() => handleMoveQueueItem(idx, 'up')}
                    onMoveDown={() => handleMoveQueueItem(idx, 'down')}
                    onStartReading={() => handleStartReading(book.id)}
                    onRemove={() => handleRemoveFromQueue(book.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.section>
        )}

        {/* Section 4: TBR Grid */}
        <motion.section variants={staggerItem}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2
                className="text-[22px] font-medium"
                style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
              >
                待读书架
              </h2>
              <p className="text-xs mt-0.5" style={{ color: C.textSecondary }}>
                所有想读的书
              </p>
            </div>

            <div className="flex gap-1.5">
              {genreFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTbrFilter(filter)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: tbrFilter === filter ? 'rgba(91,126,113,0.12)' : 'transparent',
                    color: tbrFilter === filter ? C.accentMorandi : C.textSecondary,
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="flex flex-wrap gap-4 mb-4 px-4 py-2.5 rounded-lg text-xs" style={{ backgroundColor: C.bgCard }}>
            <span style={{ color: C.textSecondary }}>
              计划中 <strong style={{ color: C.accentHaze }}>{preludeBooks.length}</strong> 本
            </span>
            <span style={{ color: C.borderSubtle }}>|</span>
            <span style={{ color: C.textSecondary }}>
              进行中 <strong style={{ color: C.accentMorandi }}>{readingBooks.length}</strong> 本
            </span>
            <span style={{ color: C.borderSubtle }}>|</span>
            <span style={{ color: C.textSecondary }}>
              本月目标 <strong style={{ color: C.accentWarm }}>{monthGoal?.current ?? 0}/{monthGoal?.target ?? 0}</strong>
            </span>
          </div>

          {tbrBooks.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              {tbrBooks.map((book) => (
                <TBRCard
                  key={book.id}
                  book={book}
                  inQueue={queueBookIds.has(book.id)}
                  onAddToQueue={() => handleAddToQueue(book.id)}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-10 rounded-xl border" style={{ borderColor: C.borderSubtle, backgroundColor: C.bgCard }}>
              <p className="text-sm" style={{ color: C.textMuted }}>
                {tbrFilter === '全部' ? '暂无待读书籍' : `暂无${tbrFilter}类书籍`}
              </p>
            </div>
          )}
        </motion.section>

        {/* Section 5: Completed Goals Archive */}
        {completedGoals.length > 0 && (
          <motion.section variants={staggerItem}>
            <button onClick={() => setShowCompletedGoals((v) => !v)} className="flex items-center gap-2 mb-4 group">
              <h2
                className="text-lg font-medium"
                style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
              >
                已完成的目标
              </h2>
              <motion.div animate={{ rotate: showCompletedGoals ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4" style={{ color: C.textMuted }} />
              </motion.div>
            </button>

            <AnimatePresence>
              {showCompletedGoals && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: easeOut }}
                  className="overflow-hidden"
                >
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                    {completedGoals.map((goal) => (
                      <motion.div
                        key={goal.id}
                        variants={staggerItem}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                        style={{ backgroundColor: C.bgCard, borderColor: C.borderSubtle }}
                      >
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} />
                        <p className="text-sm flex-1 line-through" style={{ color: C.textMuted }}>
                          {goal.title} — {goal.target} {goal.unit}
                        </p>
                        <span className="text-xs" style={{ color: C.textMuted }}>
                          完成于 {goal.completedAt ? formatDateCN(goal.completedAt) : ''}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        )}

        {/* Empty State */}
        {preludeBooks.length === 0 && readingBooks.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6"
            >
              <ListOrdered className="w-20 h-20" style={{ color: C.textMuted, opacity: 0.4 }} />
            </motion.div>
            <h3
              className="text-[18px] font-medium mb-2"
              style={{ fontFamily: 'LXGW WenKai, "PingFang SC", sans-serif', color: C.textPrimary }}
            >
              还没有阅读计划
            </h3>
            <p className="text-sm" style={{ color: C.textSecondary }}>
              创建你的第一个阅读目标，或从书架添加想读的书
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
