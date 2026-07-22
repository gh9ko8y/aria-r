import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Search, X, Filter } from 'lucide-react';
import type { Essay, Book } from '@/types';
import {
  getEssays,
  addEssay,
  updateEssay,
  deleteEssay,
  getBooks,
} from '@/lib/storage';
import EssayCard from './essays/EssayCard';
import EssayDetail from './essays/EssayDetail';
import EssayEditor from './essays/EssayEditor';
import EmptyState from './essays/EmptyState';

export default function Essays() {
  const [essays, setEssays] = useState<Essay[]>(getEssays());
  const [books] = useState<Book[]>(getBooks());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [editingEssay, setEditingEssay] = useState<Essay | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Build book lookup map
  const bookMap = useMemo(() => {
    const map: Record<string, Book> = {};
    books.forEach((b) => { map[b.id] = b; });
    return map;
  }, [books]);

  // Get all unique tags from essays
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    essays.forEach((e) => e.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [essays]);

  // Filter and sort essays: pinned first, then by date
  const filteredEssays = useMemo(() => {
    let result = [...essays];

    // Full-text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (activeTagFilter) {
      result = result.filter((e) => e.tags.includes(activeTagFilter));
    }

    // Sort: pinned first, then newest
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [essays, searchQuery, activeTagFilter]);

  // Refresh from storage
  const refresh = useCallback(() => {
    setEssays(getEssays());
  }, []);

  // Toggle pin
  const handleTogglePin = useCallback(
    (id: string) => {
      const essay = essays.find((e) => e.id === id);
      if (!essay) return;
      const updated = { ...essay, isPinned: !essay.isPinned };
      updateEssay(updated);
      refresh();
    },
    [essays, refresh]
  );

  // Save (create or update)
  const handleSave = useCallback(
    (data: Omit<Essay, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
      if (data.id) {
        // Update
        const existing = essays.find((e) => e.id === data.id);
        if (existing) {
          updateEssay({
            ...existing,
            ...data,
            id: data.id,
          } as Essay);
        }
      } else {
        // Create
        const newEssay: Essay = {
          ...data,
          id: `essay-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addEssay(newEssay);
      }
      refresh();
      setShowEditor(false);
      setEditingEssay(null);
    },
    [essays, refresh]
  );

  // Delete
  const handleDelete = useCallback(
    (id: string) => {
      deleteEssay(id);
      setSelectedEssay(null);
      refresh();
    },
    [refresh]
  );

  // Open editor for new essay
  const handleAddNew = useCallback(() => {
    setEditingEssay(null);
    setShowEditor(true);
  }, []);

  // Open editor for existing essay
  const handleEdit = useCallback((essay: Essay) => {
    setSelectedEssay(null);
    setEditingEssay(essay);
    setShowEditor(true);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Clear tag filter
  const clearTagFilter = useCallback(() => {
    setActiveTagFilter(null);
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1
            className="text-[28px] font-medium"
            style={{
              fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
              color: '#2C2C2C',
              lineHeight: 1.25,
              letterSpacing: '0',
            }}
          >
            随笔
          </h1>
          <button
            onClick={handleAddNew}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-medium text-white transition-all hover:brightness-105 hover:scale-[1.02] active:scale-[0.97]"
            style={{ backgroundColor: '#5B7E71' }}
          >
            <PenLine size={14} />
            新随笔
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B8E]" />
          <input
            type="text"
            placeholder="搜索随笔..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E2E0D8] bg-white/60 text-[14px] outline-none transition-all focus:ring-1 focus:ring-[#5B7E71] focus:border-[#5B7E71] placeholder:text-[#9B9B8E]"
            style={{
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
              letterSpacing: '0.01em',
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-[#E2E0D8] transition-colors"
            >
              <X className="w-3.5 h-3.5 text-[#9B9B8E]" />
            </button>
          )}
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-[#9B9B8E] flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setActiveTagFilter(activeTagFilter === tag ? null : tag)
                  }
                  className="px-2.5 py-[3px] rounded-full text-[11px] transition-all duration-150"
                  style={{
                    backgroundColor:
                      activeTagFilter === tag
                        ? 'rgba(91, 126, 113, 0.15)'
                        : 'rgba(107, 143, 173, 0.08)',
                    color:
                      activeTagFilter === tag ? '#5B7E71' : '#6B8FAD',
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    letterSpacing: '0.04em',
                    border:
                      activeTagFilter === tag
                        ? '1px solid rgba(91, 126, 113, 0.3)'
                        : '1px solid transparent',
                  }}
                >
                  {tag}
                </button>
              ))}
              {activeTagFilter && (
                <button
                  onClick={clearTagFilter}
                  className="text-[11px] underline transition-colors"
                  style={{ color: '#9B9B8E' }}
                >
                  清除
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {essays.length === 0 ? (
        <EmptyState onAdd={handleAddNew} />
      ) : filteredEssays.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <p
            className="text-[15px] text-[#6B6B6B] mb-2"
            style={{
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
            }}
          >
            没有找到匹配的随笔
          </p>
          <p className="text-[13px] text-[#9B9B8E] mb-4">
            试试其他关键词或清除筛选
          </p>
          <button
            onClick={() => {
              clearSearch();
              clearTagFilter();
            }}
            className="text-[13px] underline transition-colors"
            style={{ color: '#6B8FAD' }}
          >
            清除所有筛选
          </button>
        </motion.div>
      ) : (
        /* Masonry Grid */
        <div
          className="columns-1 sm:columns-2 lg:columns-3 gap-4"
          style={{ columnFill: 'balance' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredEssays.map((essay, index) => (
              <EssayCard
                key={essay.id}
                essay={essay}
                index={index}
                bookTitle={
                  essay.relatedBookId
                    ? bookMap[essay.relatedBookId]?.title
                    : undefined
                }
                onClick={() => setSelectedEssay(essay)}
                onTogglePin={() => handleTogglePin(essay.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Floating Action Button (mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
        onClick={handleAddNew}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          backgroundColor: '#5B7E71',
          boxShadow: '0 4px 12px rgba(91, 126, 113, 0.35)',
        }}
      >
        <PenLine size={20} />
      </motion.button>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEssay && (
          <EssayDetail
            essay={selectedEssay}
            bookTitle={
              selectedEssay.relatedBookId
                ? bookMap[selectedEssay.relatedBookId]?.title
                : undefined
            }
            onClose={() => setSelectedEssay(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePin={handleTogglePin}
          />
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <EssayEditor
            essay={editingEssay}
            books={books}
            onSave={handleSave}
            onClose={() => {
              setShowEditor(false);
              setEditingEssay(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
