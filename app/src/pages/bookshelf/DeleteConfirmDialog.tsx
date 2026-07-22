import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { Book } from '@/types';

interface DeleteConfirmDialogProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ book, isOpen, onClose, onConfirm }: DeleteConfirmDialogProps) {
  if (!book) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(44,44,44,0.3)] backdrop-blur-[4px]"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-[420px] bg-[#F8F6F0] rounded-2xl shadow-[0_24px_48px_rgba(44,44,44,0.12)] z-10 p-6"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#C47C7C]/10 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-[#C47C7C]" />
              </div>

              <h3
                className="text-[18px] font-medium text-[#2C2C2C] mb-2"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                确认删除
              </h3>
              <p className="text-[14px] text-[#6B6B6B] mb-6">
                确定要删除《{book.title}》吗？相关摘录也将被删除。
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-[#E2E0D8] text-[#6B6B6B] rounded-[10px] text-sm font-medium hover:bg-[#F0F0F0] transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => { onConfirm(); onClose(); }}
                  className="flex-1 px-4 py-2.5 bg-[#C47C7C] text-white rounded-[10px] text-sm font-medium hover:brightness-105 hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
