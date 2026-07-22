import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Tag, BookOpen, MapPin, CloudSun, Smile } from 'lucide-react';
import type { Essay, Book } from '@/types';
import { getAllTags } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EssayEditorProps {
  essay: Essay | null; // null = create mode
  books: Book[];
  onSave: (essay: Omit<Essay, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onClose: () => void;
}

export default function EssayEditor({ essay, books, onSave, onClose }: EssayEditorProps) {
  const isEditMode = !!essay;
  const [title, setTitle] = useState(essay?.title ?? '');
  const [content, setContent] = useState(essay?.content ?? '');
  const [tags, setTags] = useState<string[]>(essay?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [mood, setMood] = useState(essay?.mood ?? '');
  const [location, setLocation] = useState(essay?.location ?? '');
  const [weather, setWeather] = useState(essay?.weather ?? '');
  const [relatedBookId, setRelatedBookId] = useState(essay?.relatedBookId ?? '');
  const [showOptionalFields, setShowOptionalFields] = useState(
    !!(essay?.mood || essay?.location || essay?.weather || essay?.relatedBookId)
  );
  const tagInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title on open
  useEffect(() => {
    setTimeout(() => titleInputRef.current?.focus(), 300);
  }, []);

  // Existing tags for autocomplete
  const existingTags = getAllTags().map((t) => t.name);
  const tagSuggestions = existingTags.filter(
    (t) =>
      t.toLowerCase().includes(tagInput.toLowerCase()) &&
      !tags.includes(t) &&
      tagInput.trim().length > 0
  );

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
    tagInputRef.current?.focus();
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;
    onSave({
      ...(essay ? { id: essay.id } : {}),
      title: title.trim(),
      content: content.trim(),
      tags,
      mood: mood || undefined,
      location: location || undefined,
      weather: weather || undefined,
      relatedBookId: relatedBookId || undefined,
      isPinned: essay?.isPinned ?? false,
    });
    onClose();
  };

  const canSave = title.trim().length > 0 && content.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(44, 44, 44, 0.3)', backdropFilter: 'blur(4px)' }}
      />

      {/* Panel */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-[560px] sm:rounded-[16px] rounded-t-[16px] max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: '#F8F6F0',
          boxShadow: '0 24px 48px rgba(44, 44, 44, 0.12)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[#E2E0D8] bg-[#F8F6F0] rounded-t-[16px]">
          <h2
            className="text-[18px] font-medium"
            style={{
              fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
              color: '#2C2C2C',
            }}
          >
            {isEditMode ? '编辑随笔' : '新随笔'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md transition-all duration-150 hover:scale-105"
            style={{ color: '#6B6B6B' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-5 space-y-4">
          {/* Title */}
          <div>
            <Input
              ref={titleInputRef as React.RefObject<HTMLInputElement>}
              placeholder="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-[#E2E0D8] bg-white/60 text-[16px] placeholder:text-[#9B9B8E] focus-visible:ring-[#5B7E71]"
              style={{
                fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            />
          </div>

          {/* Content */}
          <div>
            <Textarea
              placeholder={"写点什么...\n\n支持 Markdown 语法：**粗体**、*斜体*"}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-[#E2E0D8] bg-white/60 min-h-[200px] text-[15px] placeholder:text-[#9B9B8E] focus-visible:ring-[#5B7E71] resize-none"
              style={{
                fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif',
                lineHeight: 1.75,
                letterSpacing: '0.01em',
              }}
            />
          </div>

          {/* Tags */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-[#9B9B8E]" />
              <span className="text-[13px] text-[#6B6B6B]">标签</span>
            </div>
            <div
              className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-[#E2E0D8] bg-white/60 min-h-[40px]"
              onClick={() => tagInputRef.current?.focus()}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] cursor-pointer hover:brightness-90 transition-all"
                  style={{
                    backgroundColor: 'rgba(107, 143, 173, 0.12)',
                    color: '#6B8FAD',
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    letterSpacing: '0.04em',
                  }}
                  onClick={() => handleRemoveTag(tag)}
                  title="点击移除"
                >
                  {tag}
                  <X className="w-2.5 h-2.5" />
                </span>
              ))}
              <input
                ref={tagInputRef}
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onKeyDown={handleTagKeyDown}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                placeholder={tags.length === 0 ? '添加标签...' : ''}
                className="flex-1 min-w-[80px] bg-transparent text-[13px] outline-none placeholder:text-[#9B9B8E]"
                style={{
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                }}
              />
            </div>

            {/* Tag autocomplete suggestions */}
            <AnimatePresence>
              {showTagSuggestions && tagSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 py-1.5 rounded-lg border border-[#E2E0D8] bg-white z-20 shadow-lg"
                >
                  {tagSuggestions.slice(0, 6).map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-[rgba(91,126,113,0.06)] transition-colors"
                      style={{
                        color: '#6B8FAD',
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAddTag(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle optional fields */}
          <button
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center gap-1.5 text-[12px] transition-colors duration-150 hover:underline"
            style={{ color: '#6B8FAD' }}
          >
            <Plus className="w-3.5 h-3.5" />
            {showOptionalFields ? '收起更多选项' : '添加更多信息'}
          </button>

          {/* Optional fields */}
          <AnimatePresence>
            {showOptionalFields && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 overflow-hidden"
              >
                {/* Mood */}
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#9B9B8E] flex-shrink-0" />
                  <Input
                    placeholder="心情（如：愉悦、沉思）"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="border-[#E2E0D8] bg-white/60 text-[13px] placeholder:text-[#9B9B8E] focus-visible:ring-[#5B7E71]"
                  />
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#9B9B8E] flex-shrink-0" />
                  <Input
                    placeholder="地点"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="border-[#E2E0D8] bg-white/60 text-[13px] placeholder:text-[#9B9B8E] focus-visible:ring-[#5B7E71]"
                  />
                </div>

                {/* Weather */}
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-[#9B9B8E] flex-shrink-0" />
                  <Input
                    placeholder="天气（如：晴、雨）"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="border-[#E2E0D8] bg-white/60 text-[13px] placeholder:text-[#9B9B8E] focus-visible:ring-[#5B7E71]"
                  />
                </div>

                {/* Related book */}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#9B9B8E] flex-shrink-0" />
                  <select
                    value={relatedBookId}
                    onChange={(e) => setRelatedBookId(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-md border border-[#E2E0D8] bg-white/60 text-[13px] outline-none focus:ring-1 focus:ring-[#5B7E71] appearance-none"
                    style={{
                      color: relatedBookId ? '#2C2C2C' : '#9B9B8E',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    <option value="">选择关联书籍（可选）</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 px-5 py-4 border-t border-[#E2E0D8] bg-[#F8F6F0] rounded-b-[16px] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[8px] text-[13px] font-medium border border-[#E2E0D8] transition-all hover:brightness-95"
            style={{ color: '#6B6B6B' }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-[8px] text-[13px] font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 hover:scale-[1.02] active:scale-[0.97]"
            style={{ backgroundColor: '#5B7E71' }}
          >
            落笔
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
