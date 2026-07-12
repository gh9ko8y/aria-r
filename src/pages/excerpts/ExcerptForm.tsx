import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronDown } from 'lucide-react';
import type { Excerpt, Book } from '@/types';
import VoiceRecorder from './VoiceRecorder';

interface ExcerptFormProps {
  books: Book[];
  existingTags: string[];
  editingExcerpt: Excerpt | null;
  onSave: (excerpt: Omit<Excerpt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function extractKeywords(text: string): string[] {
  if (!text || text.length < 4) return [];
  const commonWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '这些', '那些',
  ]);
  const segments = text.split(/[,，.。.!！?？;；、\s]+/);
  const keywords: string[] = [];
  for (const seg of segments) {
    const trimmed = seg.trim();
    if (trimmed.length >= 2 && trimmed.length <= 8 && !commonWords.has(trimmed)) {
      keywords.push(trimmed);
    }
  }
  return [...new Set(keywords)].slice(0, 5);
}

export default function ExcerptForm({ books, existingTags, editingExcerpt, onSave, onCancel }: ExcerptFormProps) {
  const [bookId, setBookId] = useState(editingExcerpt?.bookId ?? (books[0]?.id ?? ''));
  const [content, setContent] = useState(editingExcerpt?.content ?? '');
  const [thought, setThought] = useState(editingExcerpt?.thought ?? '');
  const [chapter, setChapter] = useState(editingExcerpt?.chapter ?? '');
  const [page, setPage] = useState(editingExcerpt?.page?.toString() ?? '');
  const [tags, setTags] = useState<string[]>(editingExcerpt?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedBook = books.find(b => b.id === bookId);

  useEffect(() => {
    if (editingExcerpt) {
      setBookId(editingExcerpt.bookId);
      setContent(editingExcerpt.content);
      setThought(editingExcerpt.thought ?? '');
      setChapter(editingExcerpt.chapter ?? '');
      setPage(editingExcerpt.page?.toString() ?? '');
      setTags(editingExcerpt.tags);
    }
  }, [editingExcerpt]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(e.target as Node)) {
        setShowBookDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (content.length >= 10) {
        const keywords = extractKeywords(content);
        const existingLower = existingTags.map(t => t.toLowerCase());
        const newSuggestions = keywords.filter(k => existingLower.includes(k.toLowerCase()) && !tags.includes(k));
        setSuggestedTags(newSuggestions);
        setShowTagSuggestions(newSuggestions.length > 0);
      }
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [content, existingTags, tags]);

  const handleVoiceTranscript = useCallback((text: string) => {
    setContent(prev => prev ? `${prev} ${text}` : text);
  }, []);

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (tagInput.trim()) {
        handleAddTag(tagInput);
      }
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !bookId) return;

    onSave({
      bookId,
      content: content.trim(),
      thought: thought.trim() || '',
      chapter: chapter.trim() || '',
      page: page ? parseInt(page, 10) : 0,
      tags,
    });

    if (!editingExcerpt) {
      setContent('');
      setThought('');
      setChapter('');
      setPage('');
      setTags([]);
      setTagInput('');
    }
  };

  const isValid = content.trim().length > 0 && bookId;

  const availableTagSuggestions = existingTags
    .filter(t => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase()))
    .slice(0, 6);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 24,
        opacity: { duration: 0.25 },
      }}
      className="overflow-hidden"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-[16px] p-5 md:p-6 mb-6 mx-auto"
        style={{
          backgroundColor: '#F0F0F0',
          border: '1px solid #E2E0D8',
          maxWidth: '800px',
        }}
      >
        {/* Book Selector */}
        <div className="relative mb-4" ref={bookDropdownRef}>
          <button
            type="button"
            onClick={() => setShowBookDropdown(!showBookDropdown)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-[8px] text-left transition-colors duration-150"
            style={{
              backgroundColor: '#F8F6F0',
              border: '1px solid #E2E0D8',
              color: selectedBook ? '#2C2C2C' : '#9B9B8E',
            }}
          >
            <span className="flex items-center gap-2">
              {selectedBook ? (
                <>
                  <span className="text-sm font-medium">{selectedBook.title}</span>
                  <span className="text-xs" style={{ color: '#6B6B6B' }}>{selectedBook.author}</span>
                </>
              ) : (
                <span className="text-sm">选择来源书籍</span>
              )}
            </span>
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{
                color: '#9B9B8E',
                transform: showBookDropdown ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          </button>

          <AnimatePresence>
            {showBookDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 w-full mt-1 rounded-[8px] overflow-hidden shadow-lg"
                style={{
                  backgroundColor: '#F8F6F0',
                  border: '1px solid #E2E0D8',
                  maxHeight: '240px',
                  overflowY: 'auto',
                }}
              >
                {books.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => {
                      setBookId(book.id);
                      setShowBookDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-black/5"
                    style={{
                      backgroundColor: book.id === bookId ? 'rgba(91, 126, 113, 0.08)' : 'transparent',
                    }}
                  >
                    <span className="text-sm" style={{ color: '#2C2C2C' }}>{book.title}</span>
                    <span className="text-xs" style={{ color: '#6B6B6B' }}>{book.author}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chapter and Page */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="章节名"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="px-3 py-2 rounded-[8px] text-sm outline-none transition-colors duration-150 focus:ring-2"
            style={{
              backgroundColor: '#F8F6F0',
              border: '1px solid #E2E0D8',
              color: '#2C2C2C',
              width: '160px',
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          />
          <input
            type="number"
            placeholder="页码"
            value={page}
            onChange={(e) => setPage(e.target.value)}
            className="px-3 py-2 rounded-[8px] text-sm outline-none transition-colors duration-150 focus:ring-2"
            style={{
              backgroundColor: '#F8F6F0',
              border: '1px solid #E2E0D8',
              color: '#2C2C2C',
              width: '80px',
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Excerpt textarea with voice button */}
        <div className="relative mb-3">
          <textarea
            ref={contentRef}
            placeholder="摘录原文..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-[8px] outline-none transition-all duration-150 resize-none focus:ring-2"
            style={{
              backgroundColor: '#F8F6F0',
              border: '1px solid #E2E0D8',
              borderLeftWidth: '3px',
              borderLeftColor: '#5B7E71',
              color: '#2C2C2C',
              minHeight: '120px',
              maxHeight: '300px',
              fontSize: '17px',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
            }}
          />
          <div className="absolute bottom-3 right-3">
            <VoiceRecorder onTranscript={handleVoiceTranscript} />
          </div>
        </div>

        {/* Thought textarea */}
        <textarea
          placeholder="你的感想...（可选）"
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          className="w-full px-4 py-3 rounded-[8px] outline-none transition-all duration-150 resize-none mb-4 focus:ring-2"
          style={{
            backgroundColor: '#F8F6F0',
            border: '1px solid #E2E0D8',
            color: '#2C2C2C',
            minHeight: '80px',
            maxHeight: '200px',
            fontSize: '15px',
            lineHeight: 1.65,
            letterSpacing: '0.01em',
            fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
          }}
        />

        {/* Smart tag suggestions */}
        <AnimatePresence>
          {showTagSuggestions && suggestedTags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex items-center gap-2 overflow-hidden"
            >
              <span className="text-xs flex-shrink-0" style={{ color: '#9B9B8E', fontFamily: 'Inter, system-ui, sans-serif' }}>
                推荐标签：
              </span>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      handleAddTag(tag);
                      setShowTagSuggestions(false);
                    }}
                    className="px-2.5 py-[2px] rounded-full text-[11px] transition-all duration-150 hover:brightness-95"
                    style={{
                      backgroundColor: 'rgba(91, 126, 113, 0.12)',
                      color: '#5B7E71',
                      fontFamily: '"JetBrains Mono", "Courier New", monospace',
                      letterSpacing: '0.08em',
                    }}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag input */}
        <div className="mb-5">
          <div
            className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-[8px]"
            style={{
              backgroundColor: '#F8F6F0',
              border: '1px solid #E2E0D8',
              minHeight: '42px',
            }}
            onClick={() => tagInputRef.current?.focus()}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-[2px] rounded-full text-[11px]"
                style={{
                  backgroundColor: 'rgba(107, 143, 173, 0.1)',
                  color: '#6B8FAD',
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                  letterSpacing: '0.08em',
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              placeholder={tags.length === 0 ? '添加标签...' : ''}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1 min-w-[80px] bg-transparent outline-none text-sm"
              style={{
                color: '#2C2C2C',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
              }}
            />
          </div>

          {/* Tag autocomplete dropdown */}
          <AnimatePresence>
            {tagInput && availableTagSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-1 rounded-[8px] overflow-hidden shadow-md"
                style={{
                  backgroundColor: '#F8F6F0',
                  border: '1px solid #E2E0D8',
                }}
              >
                {availableTagSuggestions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-black/5"
                    style={{ color: '#2C2C2C' }}
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-[8px] transition-all duration-150 hover:bg-black/5"
            style={{ color: '#6B6B6B' }}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[10px] text-white text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 hover:scale-[1.02] active:scale-[0.97]"
            style={{ backgroundColor: '#5B7E71' }}
          >
            <Check className="w-4 h-4" />
            {editingExcerpt ? '更新' : '落笔'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
