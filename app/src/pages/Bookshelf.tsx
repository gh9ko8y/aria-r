import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  BookOpen,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Edit3,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, ReadingStatus } from '@/types';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  initMockData,
} from '@/lib/storage';

import StatusTabs from './bookshelf/StatusTabs';
import BookCard from './bookshelf/BookCard';
import EmptyState from './bookshelf/EmptyState';
import AddBookModal from './bookshelf/AddBookModal';
import BookDetailDrawer from './bookshelf/BookDetailDrawer';
import DeleteConfirmDialog from './bookshelf/DeleteConfirmDialog';

type SortOption = 'recent' | 'title' | 'rating' | 'progress';
type ViewMode = 'grid' | 'list';

const sortLabels: Record<SortOption, string> = {
  recent: '最近添加',
  title: '书名 A-Z',
  rating: '评分最高',
  progress: '阅读进度',
};

export default function Bookshelf() {
  // Initialize mock data on first load
  useEffect(() => {
    initMockData();
  }, []);

  const [books, setBooks] = useState<Book[]>(getBooks);
  const [activeTab, setActiveTab] = useState<ReadingStatus>('prelude');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editBookData, setEditBookData] = useState<Book | null>(null);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteBookData, setDeleteBookData] = useState<Book | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Refresh books from storage
  const refreshBooks = useCallback(() => {
    setBooks(getBooks());
  }, []);

  // Filtered and sorted books
  const filteredBooks = useMemo(() => {
    let result = books.filter((b) => b.status === activeTab);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter((b) => selectedTags.some((tag) => b.tags.includes(tag)));
    }

    // Sort
    switch (sortBy) {
      case 'title':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
        break;
      case 'rating':
        result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'progress':
        result = [...result].sort((a, b) => {
          const pa = a.pageCount && a.currentPage ? a.currentPage / a.pageCount : 0;
          const pb = b.pageCount && b.currentPage ? b.currentPage / b.pageCount : 0;
          return pb - pa;
        });
        break;
      case 'recent':
      default:
        result = [...result].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return result;
  }, [books, activeTab, searchQuery, sortBy, selectedTags]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const counts: Record<ReadingStatus, number> = {
      prelude: books.filter((b) => b.status === 'prelude').length,
      andante: books.filter((b) => b.status === 'andante').length,
      finale: books.filter((b) => b.status === 'finale').length,
    };
    return counts;
  }, [books]);

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    books.forEach((b) => b.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [books]);

  // Handlers
  const handleAddBook = useCallback(
    (book: Book) => {
      if (editBookData) {
        updateBook(book);
      } else {
        addBook(book);
      }
      refreshBooks();
      setEditBookData(null);
    },
    [editBookData, refreshBooks]
  );

  const handleEditBook = useCallback((book: Book) => {
    setEditBookData(book);
    setIsAddModalOpen(true);
  }, []);

  const handleDeleteBook = useCallback((book: Book) => {
    setDeleteBookData(book);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteBookData) {
      deleteBook(deleteBookData.id);
      refreshBooks();
      setDeleteBookData(null);
    }
  }, [deleteBookData, refreshBooks]);

  const handleOpenDetail = useCallback((book: Book) => {
    setDetailBook(book);
    setIsDetailOpen(true);
  }, []);

  const handleStatusChange = useCallback(
    (book: Book, status: ReadingStatus) => {
      const updated = { ...book, status, updatedAt: new Date().toISOString() };
      if (status === 'andante' && !updated.currentPage) {
        updated.currentPage = 0;
      }
      if (status === 'finale' && updated.pageCount) {
        updated.currentPage = updated.pageCount;
      }
      updateBook(updated);
      refreshBooks();
      if (detailBook?.id === book.id) {
        setDetailBook(updated);
      }
    },
    [refreshBooks, detailBook]
  );

  const handleUpdateBook = useCallback(
    (updated: Book) => {
      updateBook(updated);
      refreshBooks();
      setDetailBook(updated);
    },
    [refreshBooks]
  );

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Refresh when tab changes to keep data in sync
  useEffect(() => {
    refreshBooks();
  }, [activeTab, refreshBooks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="min-h-[100dvh] bg-[#F8F6F0]"
    >
      {/* Page Header */}
      <div className="sticky top-0 z-30 bg-[#F8F6F0] border-b border-[#E2E0D8]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[24px] md:text-[28px] font-medium text-[#2C2C2C]"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              我的书架
            </motion.h1>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center gap-2"
            >
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B8E]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索书名、作者…"
                  className="w-[200px] lg:w-[240px] h-9 pl-9 pr-8 text-sm bg-[#F0F0F0] border border-[#E2E0D8] rounded-full text-[#2C2C2C] placeholder:text-[#9B9B8E] focus:outline-none focus:ring-2 focus:ring-[#5B7E71]/30 focus:border-[#5B7E71] transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9B9B8E] hover:text-[#6B6B6B] cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-1.5 h-9 px-3 rounded-full text-sm transition-all cursor-pointer border',
                  showFilters
                    ? 'bg-[#5B7E71]/12 text-[#5B7E71] border-[#5B7E71]/30'
                    : 'bg-[#F0F0F0] text-[#6B6B6B] border-[#E2E0D8] hover:border-[#D0CEC6]'
                )}
              >
                <SlidersHorizontal size={15} />
                <span className="hidden md:inline">筛选</span>
              </button>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center h-9 bg-[#F0F0F0] rounded-full border border-[#E2E0D8] p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer',
                    viewMode === 'grid' ? 'bg-white shadow-sm text-[#5B7E71]' : 'text-[#9B9B8E] hover:text-[#6B6B6B]'
                  )}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer',
                    viewMode === 'list' ? 'bg-white shadow-sm text-[#5B7E71]' : 'text-[#9B9B8E] hover:text-[#6B6B6B]'
                  )}
                >
                  <List size={15} />
                </button>
              </div>

              {/* Add Book Button */}
              <button
                onClick={() => {
                  setEditBookData(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#5B7E71] text-white rounded-[10px] text-sm font-medium hover:brightness-105 hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer shadow-sm"
              >
                <Plus size={16} />
                <span className="hidden md:inline">添加书籍</span>
              </button>
            </motion.div>
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden pb-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B8E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索书名、作者…"
                className="w-full h-10 pl-9 pr-8 text-sm bg-[#F0F0F0] border border-[#E2E0D8] rounded-full text-[#2C2C2C] placeholder:text-[#9B9B8E] focus:outline-none focus:ring-2 focus:ring-[#5B7E71]/30 focus:border-[#5B7E71] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B8E] hover:text-[#6B6B6B] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden bg-[#F5F4EE] border-b border-[#E2E0D8]"
          >
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-4">
              <div className="flex flex-wrap items-center gap-6">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#6B6B6B]">排序</span>
                  <div className="flex gap-1">
                    {(Object.keys(sortLabels) as SortOption[]).map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSortBy(opt)}
                        className={cn(
                          'px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer',
                          sortBy === opt
                            ? 'bg-[#5B7E71]/12 text-[#5B7E71]'
                            : 'text-[#6B6B6B] hover:bg-[#F0F0F0]'
                        )}
                      >
                        {sortLabels[opt]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#6B6B6B]">标签</span>
                    <div className="flex flex-wrap gap-1">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-[11px] transition-all cursor-pointer border',
                            selectedTags.includes(tag)
                              ? 'bg-[#6B8FAD]/15 text-[#6B8FAD] border-[#6B8FAD]/30'
                              : 'bg-transparent text-[#6B6B6B] border-[#E2E0D8] hover:border-[#D0CEC6]'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clear Filters */}
                {(selectedTags.length > 0 || sortBy !== 'recent') && (
                  <button
                    onClick={() => {
                      setSelectedTags([]);
                      setSortBy('recent');
                    }}
                    className="text-[12px] text-[#C47C7C] hover:underline cursor-pointer"
                  >
                    清除筛选
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-8">
        {/* Status Tabs */}
        <StatusTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />

        {/* Book Grid/List */}
        <AnimatePresence mode="wait">
          {filteredBooks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState onAddBook={() => { setEditBookData(null); setIsAddModalOpen(true); }} />
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredBooks.map((book, i) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      index={i}
                      onOpenDetail={handleOpenDetail}
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBooks.map((book, i) => (
                    <ListBookCard
                      key={book.id}
                      book={book}
                      index={i}
                      onOpenDetail={handleOpenDetail}
                      onEdit={handleEditBook}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        {filteredBooks.length > 0 && (
          <p className="text-[12px] text-[#9B9B8E] mt-6 text-center">
            共 {filteredBooks.length} 本书
          </p>
        )}
      </div>

      {/* Modals */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditBookData(null);
        }}
        onSave={handleAddBook}
        editBook={editBookData}
      />

      <BookDetailDrawer
        book={detailBook}
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setDetailBook(null); }}
        onEdit={(book) => { setIsDetailOpen(false); handleEditBook(book); }}
        onDelete={handleDeleteBook}
        onStatusChange={handleStatusChange}
        onUpdateBook={handleUpdateBook}
      />

      <DeleteConfirmDialog
        book={deleteBookData}
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteBookData(null); }}
        onConfirm={handleConfirmDelete}
      />
    </motion.div>
  );
}

// List View Card Component
function ListBookCard({
  book,
  index,
  onOpenDetail,
  onEdit,
  onDelete,
}: {
  book: Book;
  index: number;
  onOpenDetail: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const statusConfig: Record<ReadingStatus, { label: string; color: string; bg: string }> = {
    prelude: { label: '序曲', color: 'text-[#6B8FAD]', bg: 'bg-[#6B8FAD]/12' },
    andante: { label: '行板', color: 'text-[#5B7E71]', bg: 'bg-[#5B7E71]/12' },
    finale: { label: '终章', color: 'text-[#7BAE7F]', bg: 'bg-[#7BAE7F]/12' },
  };
  const status = statusConfig[book.status];
  const progressPercent = book.pageCount && book.currentPage
    ? Math.round((book.currentPage / book.pageCount) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      }}
      onClick={() => onOpenDetail(book)}
      className={cn(
        'group flex gap-4 bg-[#F0F0F0] border border-[#E2E0D8] rounded-[10px] p-4 cursor-pointer',
        'shadow-[0_1px_3px_rgba(44,44,44,0.04)]',
        'transition-all duration-300',
        'hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(44,44,44,0.08)]'
      )}
    >
      {/* Cover */}
      <div className="shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden bg-[#E2E0D8]">
        {book.cover && !imageError ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9B9B8E]">
            <BookOpen size={24} className="opacity-40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className={cn('inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-medium mb-1.5', status.bg, status.color)}>
              {status.label}
            </div>
            <h3
              className="text-[16px] font-medium text-[#2C2C2C] truncate leading-tight"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              {book.title}
            </h3>
            <p className="text-[13px] text-[#6B6B6B] mt-0.5">{book.author}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(book); }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#9B9B8E] hover:text-[#5B7E71] hover:bg-[#E2E0D8]/50 transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(book); }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[#9B9B8E] hover:text-[#C47C7C] hover:bg-[#C47C7C]/10 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Progress */}
        {book.status !== 'prelude' && book.pageCount && (
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-[#E2E0D8] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-[#5B7E71] rounded-full"
                />
              </div>
              <span className="text-[11px] text-[#9B9B8E] shrink-0">{progressPercent}%</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-[#6B8FAD]/10 text-[#6B8FAD]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}


