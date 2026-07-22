import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Upload, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Book, ReadingStatus } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import StarRating from './StarRating';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  editBook?: Book | null;
}

const statusOptions: { key: ReadingStatus; label: string; desc: string }[] = [
  { key: 'prelude', label: '序曲', desc: '计划阅读' },
  { key: 'andante', label: '行板', desc: '正在阅读' },
  { key: 'finale', label: '终章', desc: '已读完' },
];

const statusColors: Record<ReadingStatus, { text: string; bg: string; border: string; ring: string }> = {
  prelude: { text: 'text-[#6B8FAD]', bg: 'bg-[#6B8FAD]/12', border: 'border-[#6B8FAD]', ring: 'ring-[#6B8FAD]/30' },
  andante: { text: 'text-[#5B7E71]', bg: 'bg-[#5B7E71]/12', border: 'border-[#5B7E71]', ring: 'ring-[#5B7E71]/30' },
  finale: { text: 'text-[#7BAE7F]', bg: 'bg-[#7BAE7F]/12', border: 'border-[#7BAE7F]', ring: 'ring-[#7BAE7F]/30' },
};

export default function AddBookModal({ isOpen, onClose, onSave, editBook }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [cover, setCover] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('prelude');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const isEditing = !!editBook;

  useEffect(() => {
    if (editBook) {
      setTitle(editBook.title);
      setAuthor(editBook.author);
      setIsbn(editBook.isbn || '');
      setDescription(editBook.description || '');
      setPublisher(editBook.publisher || '');
      setPublishedYear(editBook.publishedYear?.toString() || '');
      setPageCount(editBook.pageCount?.toString() || '');
      setCover(editBook.cover || '');
      setContent(editBook.content || '');
      setStatus(editBook.status);
      setRating(editBook.rating || 0);
      setTags(editBook.tags.join(', '));
    } else {
      resetForm();
    }
  }, [editBook, isOpen]);

  function resetForm() {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setDescription('');
    setPublisher('');
    setPublishedYear('');
    setPageCount('');
    setCover('');
    setContent('');
    setStatus('prelude');
    setRating(0);
    setTags('');
    setErrors({});
    setShowContent(false);
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = '请输入书名';
    if (!author.trim()) newErrors.author = '请输入作者';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const now = new Date().toISOString();
    const book: Book = {
      id: editBook?.id || `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim() || '',
      description: description.trim() || '',
      publisher: publisher.trim() || '',
      publishedYear: publishedYear ? parseInt(publishedYear) : 0,
      pageCount: pageCount ? parseInt(pageCount) : 0,
      currentPage: editBook?.currentPage || 0,
      status,
      cover: cover.trim() || '',
      rating: rating || 0,
      startDate: editBook?.startDate || null,
      finishDate: editBook?.finishDate || null,
      progress: editBook?.progress || 0,
      review: editBook?.review || '',
      tags: tags.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      content: content.trim() || '',
      createdAt: editBook?.createdAt || now,
      updatedAt: now,
    };

    onSave(book);
    resetForm();
    onClose();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  // 上传封面图片（转为 base64）
  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCover(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  // 通过 ISBN 或书名自动查询书籍信息
  async function handleAutoSearch() {
    const searchTerm = isbn.trim() || title.trim();
    if (!searchTerm) {
      setErrors({ isbn: '请输入 ISBN 或书名后再搜索' });
      return;
    }

    setIsSearching(true);
    setErrors({});

    try {
      // 使用 Google Books API 查询
      const query = isbn.trim() ? `isbn:${isbn.trim()}` : `intitle:${title.trim()}`;
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=1`);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const bookInfo = data.items[0].volumeInfo;

        // 只填充用户未手动填写的字段
        if (!title.trim() || title.trim() === bookInfo.title) setTitle(bookInfo.title || '');
        if (!author.trim()) setAuthor(bookInfo.authors?.join(', ') || '');
        if (!description.trim()) setDescription(bookInfo.description || '');
        if (!publisher.trim()) setPublisher(bookInfo.publisher || '');
        if (!publishedYear) setPublishedYear(bookInfo.publishedDate?.substring(0, 4) || '');
        if (!pageCount) setPageCount(bookInfo.pageCount?.toString() || '');
        if (!isbn.trim()) setIsbn(bookInfo.industryIdentifiers?.[0]?.identifier || '');

        // 如果用户没有上传封面，使用 API 返回的封面
        if (!cover && bookInfo.imageLinks?.thumbnail) {
          setCover(bookInfo.imageLinks.thumbnail.replace('http://', 'https://'));
        }

        // 自动填充标签
        if (!tags.trim() && bookInfo.categories) {
          setTags(bookInfo.categories.join(', '));
        }
      } else {
        setErrors({ isbn: '未找到相关书籍，请手动填写' });
      }
    } catch {
      setErrors({ isbn: '查询失败，请手动填写' });
    } finally {
      setIsSearching(false);
    }
  }

  const tagList = tags.split(/[,，]/).map(t => t.trim()).filter(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[rgba(44,44,44,0.3)] backdrop-blur-[4px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="relative w-full max-w-[560px] max-h-[85vh] overflow-y-auto bg-[#F8F6F0] rounded-2xl shadow-[0_24px_48px_rgba(44,44,44,0.12)] z-10"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#F8F6F0] border-b border-[#E2E0D8] rounded-t-2xl">
              <h2
                className="text-[22px] font-medium text-[#2C2C2C]"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                {isEditing ? '编辑书籍' : '添加新书'}
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6B6B] hover:bg-[#F0F0F0] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-5">
              {/* Cover Preview + Upload */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <label className="block w-24 h-32 bg-[#E2E0D8] rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#5B7E71]/30 transition-all">
                    {cover ? (
                      <img src={cover} alt="cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload size={20} className="text-[#9B9B8E]" />
                        <span className="text-[10px] text-[#9B9B8E]">上传封面</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">封面链接（可选）</Label>
                    <Input
                      value={cover.startsWith('data:') ? '' : cover}
                      onChange={(e) => setCover(e.target.value)}
                      placeholder="https://... 或上传图片"
                      className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">ISBN</Label>
                    <div className="flex gap-2">
                      <Input
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="978-..."
                        className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleAutoSearch}
                        disabled={isSearching}
                        className="px-3 py-2 bg-[#5B7E71] text-white rounded-[10px] hover:brightness-105 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      </button>
                    </div>
                    {errors.isbn && <p className="text-[12px] text-[#C47C7C] mt-1">{errors.isbn}</p>}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">
                  书名 <span className="text-[#C47C7C]">*</span>
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入书名"
                  className={cn(
                    'bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm',
                    errors.title && 'border-[#C47C7C] ring-1 ring-[#C47C7C]/20'
                  )}
                />
                {errors.title && <p className="text-[12px] text-[#C47C7C] mt-1">{errors.title}</p>}
              </div>

              {/* Author */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">
                  作者 <span className="text-[#C47C7C]">*</span>
                </Label>
                <Input
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="输入作者"
                  className={cn(
                    'bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm',
                    errors.author && 'border-[#C47C7C] ring-1 ring-[#C47C7C]/20'
                  )}
                />
                {errors.author && <p className="text-[12px] text-[#C47C7C] mt-1">{errors.author}</p>}
              </div>

              {/* Publisher + Year + Pages */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">出版社</Label>
                  <Input
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="出版社"
                    className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">出版年</Label>
                  <Input
                    value={publishedYear}
                    onChange={(e) => setPublishedYear(e.target.value)}
                    placeholder="2024"
                    type="number"
                    className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">页数</Label>
                  <Input
                    value={pageCount}
                    onChange={(e) => setPageCount(e.target.value)}
                    placeholder="300"
                    type="number"
                    className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">简介</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="书籍简介..."
                  rows={3}
                  className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm resize-none"
                />
              </div>

              {/* Content for online reading */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowContent(!showContent)}
                  className="flex items-center gap-2 text-[13px] text-[#5B7E71] hover:text-[#4A6A5F] transition-colors cursor-pointer"
                >
                  <span>{showContent ? '收起' : '添加'}书籍内容（线上阅读）</span>
                  <motion.span animate={{ rotate: showContent ? 180 : 0 }}>▼</motion.span>
                </button>
                <AnimatePresence>
                  {showContent && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3">
                        <Textarea
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="粘贴书籍内容，支持纯文本..."
                          rows={8}
                          className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm resize-none"
                        />
                        <p className="text-[11px] text-[#9B9B8E] mt-1">
                          {content.length > 0 ? `${content.length} 字` : '粘贴书籍正文内容，可在书架中线上阅读'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Selection */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-2 block">阅读状态</Label>
                <div className="grid grid-cols-3 gap-3">
                  {statusOptions.map((opt) => {
                    const colors = statusColors[opt.key];
                    const isActive = status === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setStatus(opt.key)}
                        className={cn(
                          'flex flex-col items-center gap-1 py-3 px-2 rounded-[10px] border-2 transition-all duration-200 cursor-pointer',
                          isActive
                            ? `${colors.bg} ${colors.border}`
                            : 'border-[#E2E0D8] bg-[#F0F0F0] hover:border-[#D0CEC6]'
                        )}
                      >
                        <span
                          className={cn('text-sm font-medium', isActive ? colors.text : 'text-[#6B6B6B]')}
                          style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-[#9B9B8E]">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating (for finale) */}
              {status === 'finale' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label className="text-[13px] text-[#6B6B6B] mb-2 block">评分</Label>
                  <StarRating rating={rating} onRate={setRating} size={24} />
                </motion.div>
              )}

              {/* Tags */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">
                  标签 <span className="text-[#9B9B8E] text-[11px]">（用逗号分隔）</span>
                </Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="文学, 小说, 经典..."
                  className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagList.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#6B8FAD]/10 text-[#6B8FAD]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 bg-[#F8F6F0] border-t border-[#E2E0D8] rounded-b-2xl">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-[#6B6B6B] hover:text-[#2C2C2C] transition-colors cursor-pointer rounded-[10px] hover:bg-[#F0F0F0]"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#5B7E71] text-white rounded-[10px] text-sm font-medium hover:brightness-105 hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer"
              >
                <Edit3 size={14} />
                落笔
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
