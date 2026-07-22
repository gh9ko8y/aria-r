import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, SlidersHorizontal } from 'lucide-react';
import type { Excerpt, Book, SortOption } from '@/types';
import type { Tag } from '@/types';
import { getExcerpts, saveExcerpts, getBooks, getTags } from '@/lib/storage';
import { seedMockData } from '@/data/mockData';
import ExcerptCard from './excerpts/ExcerptCard';
import ExcerptForm from './excerpts/ExcerptForm';
import EmptyState from './excerpts/EmptyState';

export default function Excerpts() {
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingExcerpt, setEditingExcerpt] = useState<Excerpt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('');
  const [newlyAddedId, setNewlyAddedId] = useState<string>('');
  const [dataReady, setDataReady] = useState(false);

  // Seed mock data on first visit
  useEffect(() => {
    seedMockData();
    loadData();
  }, []);

  const loadData = () => {
    setExcerpts(getExcerpts());
    setBooks(getBooks());
    setAllTags(getTags().map((t: Tag) => t.name));
    setDataReady(true);
  };

  // Clear highlight after animation
  useEffect(() => {
    if (newlyAddedId) {
      const timer = setTimeout(() => setNewlyAddedId(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [newlyAddedId]);

  const handleSave = useCallback((data: Omit<Excerpt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    if (editingExcerpt) {
      const updated: Excerpt = {
        ...editingExcerpt,
        ...data,
        updatedAt: now,
      };
      const next = excerpts.map(e => e.id === editingExcerpt.id ? updated : e);
      setExcerpts(next);
      saveExcerpts(next);
      setEditingExcerpt(null);
    } else {
      const newExcerpt: Excerpt = {
        id: `ex-${Date.now()}`,
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      const next = [newExcerpt, ...excerpts];
      setExcerpts(next);
      saveExcerpts(next);
      setNewlyAddedId(newExcerpt.id);
    }
    setShowForm(false);
    setAllTags(getTags().map((t: Tag) => t.name));
  }, [editingExcerpt, excerpts]);

  const handleDelete = useCallback((id: string) => {
    const next = excerpts.filter(e => e.id !== id);
    setExcerpts(next);
    saveExcerpts(next);
  }, [excerpts]);

  const handleEdit = useCallback((excerpt: Excerpt) => {
    setEditingExcerpt(excerpt);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancel = () => {
    setShowForm(false);
    setEditingExcerpt(null);
  };

  const handleTagClick = (tag: string) => {
    setActiveTagFilter(prev => prev === tag ? '' : tag);
  };

  const handleAddNew = () => {
    setEditingExcerpt(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getBookForExcerpt = useCallback((excerpt: Excerpt): Book | undefined => {
    return books.find(b => b.id === excerpt.bookId);
  }, [books]);

  const filteredExcerpts = useMemo(() => {
    let result = [...excerpts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e => {
        const book = getBookForExcerpt(e);
        return (
          e.content.toLowerCase().includes(query) ||
          (e.thought?.toLowerCase().includes(query) ?? false) ||
          (book?.title.toLowerCase().includes(query) ?? false) ||
          (book?.author?.toLowerCase().includes(query) ?? false)
        );
      });
    }

    // Filter chips
    switch (activeFilter) {
      case 'withThought':
        result = result.filter(e => e.thought && e.thought.length > 0);
        break;
      case 'voice':
        result = result.filter(e => e.isVoiceInput);
        break;
      case 'thisWeek': {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        result = result.filter(e => new Date(e.createdAt) >= weekAgo);
        break;
      }
      case 'thisMonth': {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        result = result.filter(e => new Date(e.createdAt) >= monthAgo);
        break;
      }
    }

    // Tag filter
    if (activeTagFilter) {
      result = result.filter(e => e.tags.includes(activeTagFilter));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'book':
        result.sort((a, b) => {
          const bookA = getBookForExcerpt(a)?.title ?? '';
          const bookB = getBookForExcerpt(b)?.title ?? '';
          return bookA.localeCompare(bookB, 'zh-CN');
        });
        break;
    }

    return result;
  }, [excerpts, searchQuery, activeFilter, activeTagFilter, sortBy, getBookForExcerpt]);

  const filterChips: { key: string; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'withThought', label: '有感想' },
    { key: 'voice', label: '有语音' },
    { key: 'thisWeek', label: '本周' },
    { key: 'thisMonth', label: '本月' },
  ];

  if (!dataReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: '#5B7E71', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] px-4 md:px-6 lg:px-10 pb-12"
      style={{ backgroundColor: '#F8F6F0' }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="pt-16 md:pt-20 mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div>
            <h1
              className="text-[28px] md:text-[32px] mb-1"
              style={{
                fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
                color: '#2C2C2C',
                lineHeight: 1.25,
                letterSpacing: '0',
              }}
            >
              摘录集
            </h1>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.65,
                letterSpacing: '0.01em',
                fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
                color: '#6B6B6B',
              }}
            >
              你划线的句子，与那一刻的思考
            </p>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-white text-sm font-medium transition-all duration-150 hover:brightness-105 hover:scale-[1.02] active:scale-[0.97] self-start sm:self-auto"
            style={{ backgroundColor: '#5B7E71' }}
          >
            <Plus className="w-4 h-4" />
            记录摘录
          </motion.button>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 flex flex-col gap-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Search input */}
            <div
              className="relative flex-1 w-full sm:max-w-[360px]"
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: '#9B9B8E' }}
              />
              <input
                type="text"
                placeholder="搜索摘录内容、书名、感想..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none transition-all duration-150 focus:ring-2"
                style={{
                  backgroundColor: '#F0F0F0',
                  border: '1px solid #E2E0D8',
                  color: '#2C2C2C',
                  fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" style={{ color: '#9B9B8E' }} />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <SlidersHorizontal className="w-4 h-4" style={{ color: '#9B9B8E' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm outline-none cursor-pointer bg-transparent"
                style={{
                  color: '#6B6B6B',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                <option value="newest">最新</option>
                <option value="oldest">最早</option>
                <option value="book">书籍</option>
              </select>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            {filterChips.map((chip, i) => (
              <motion.button
                key={chip.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                onClick={() => setActiveFilter(chip.key)}
                className="px-3 py-[4px] rounded-full text-[11px] transition-all duration-150"
                style={{
                  backgroundColor: activeFilter === chip.key ? 'rgba(91, 126, 113, 0.12)' : 'rgba(107, 143, 173, 0.08)',
                  color: activeFilter === chip.key ? '#5B7E71' : '#6B8FAD',
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                  letterSpacing: '0.08em',
                  lineHeight: 1.4,
                }}
              >
                {chip.label}
              </motion.button>
            ))}

            {/* Active tag filter pill */}
            <AnimatePresence>
              {activeTagFilter && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setActiveTagFilter('')}
                  className="inline-flex items-center gap-1 px-3 py-[4px] rounded-full text-[11px] transition-all duration-150"
                  style={{
                    backgroundColor: 'rgba(166, 124, 82, 0.12)',
                    color: '#A67C52',
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    letterSpacing: '0.08em',
                    lineHeight: 1.4,
                  }}
                >
                  {activeTagFilter}
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <ExcerptForm
              books={books}
              existingTags={allTags}
              editingExcerpt={editingExcerpt}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </AnimatePresence>

        {/* Excerpt List */}
        {filteredExcerpts.length === 0 ? (
          excerpts.length === 0 ? (
            <EmptyState onAdd={handleAddNew} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <p style={{ color: '#6B6B6B', fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}>
                没有找到匹配的摘录
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                  setActiveTagFilter('');
                }}
                className="mt-3 text-sm transition-colors duration-150 hover:underline"
                style={{ color: '#6B8FAD' }}
              >
                清除筛选
              </button>
            </motion.div>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredExcerpts.map((excerpt, index) => (
                <ExcerptCard
                  key={excerpt.id}
                  excerpt={excerpt}
                  book={getBookForExcerpt(excerpt)}
                  index={index}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTagClick={handleTagClick}
                  highlight={excerpt.id === newlyAddedId}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
