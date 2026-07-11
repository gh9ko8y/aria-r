import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface DeleteConfirmDialogProps {
  open: boolean
  bookTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmDialog({
  open,
  bookTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(44,44,44,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-[var(--bg-cream)] rounded-2xl p-6 max-w-sm w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="text-[var(--error)]" />
                <h3 className="text-heading-lg">确认删除</h3>
              </div>
              <button onClick={onCancel} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={20} />
              </button>
            </div>
            <p className="text-body-md text-[var(--text-secondary)] mb-6">
              确定要删除《{bookTitle}》吗？相关摘录也将被删除，此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--overlay)] transition-colors"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg text-sm bg-[var(--error)] text-white hover:opacity-90 transition-opacity"
              >
                删除
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
