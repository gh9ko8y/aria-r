import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Quote size={64} className="text-[var(--text-muted)] opacity-40" strokeWidth={1} />
      </motion.div>
      <h3 className="text-heading-lg text-[var(--text-primary)] mt-4">尚无摘录</h3>
      <p className="text-body-md text-[var(--text-secondary)] mt-2">记录下那些打动你的文字吧</p>
    </motion.div>
  )
}
