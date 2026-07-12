import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
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
  const [, setStep] = useState<'method' | 'form'>('form');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [description, setDescription] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [cover, setCover] = useState('');
  const [status, setStatus] = useState<ReadingStatus>('prelude');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setStatus(editBook.status);
      setRating(editBook.rating || 0);
      setTags(editBook.tags.join(', '));
      setStep('form');
    } else {
      resetForm();
    }
  }, [editBook, isOpen]);

  function resetForm() {
    setStep('form');
    setTitle('');
    setAuthor('');
    setIsbn('');
    setDescription('');
    setPublisher('');
    setPublishedYear('');
    setPageCount('');
    setCover('');
    setStatus('prelude');
    setRating(0);
    setTags('');
    setErrors({});
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
              {/* Cover Preview + URL */}
              <div className="flex gap-4">
                <div className="shrink-0 w-24 h-32 bg-[#E2E0D8] rounded-lg overflow-hidden flex items-center justify-center">
                  {cover ? (
                    <img src={cover} alt="cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen size={24} className="text-[#9B9B8E]" />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">封面链接</Label>
                    <Input
                      value={cover}
                      onChange={(e) => setCover(e.target.value)}
                      placeholder="https://..."
                      className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">ISBN</Label>
                    <Input
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="978-..."
                      className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                    />
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

              {/* Status */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-2 block">阅读状态</Label>
                <div className="grid grid-cols-3 gap-3">
                  {statusOptions.map((option) => {
                    const colors = statusColors[option.key];
                    return (
                      <button
                        key={option.key}
                        onClick={() => setStatus(option.key)}
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-[10px] border transition-all cursor-pointer',
                          status === option.key
                            ? `${colors.bg} ${colors.border} ring-2 ${colors.ring}`
                            : 'bg-[#F0F0F0] border-[#E2E0D8] hover:border-[#D0CEC6]'
                        )}
                      >
                        <span className={cn('text-sm font-medium', status === option.key ? colors.text : 'text-[#6B6B6B]')}>
                          {option.label}
                        </span>
                        <span className="text-[11px] text-[#9B9B8E]">{option.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating - only for finale */}
              {status === 'finale' && (
                <div>
                  <Label className="text-[13px] text-[#6B6B6B] mb-2 block">评分</Label>
                  <StarRating rating={rating} onRate={setRating} size={24} />
                </div>
              )}

              {/* Tags */}
              <div>
                <Label className="text-[13px] text-[#6B6B6B] mb-1.5 block">标签</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="用逗号分隔多个标签"
                  className="bg-[#F0F0F0] border-[#E2E0D8] rounded-[10px] focus-visible:ring-[#5B7E71]/30 text-sm"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagList.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#6B8FAD]/10 text-[#6B8FAD]">
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
                className="px-5 py-2.5 rounded-[10px] text-sm text-[#6B6B6B] border border-[#E2E0D8] hover:bg-[#F0F0F0] transition-all cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-[10px] text-sm font-medium bg-[#5B7E71] text-white hover:brightness-105 active:scale-[0.97] transition-all cursor-pointer"
              >
                {isEditing ? '保存' : '添加'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
