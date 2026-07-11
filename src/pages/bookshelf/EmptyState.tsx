import { motion } from 'framer-motion'
import { Library } from 'lucide-react'

export default function EmptyState({ status }: { status?: string }) {
  const messages: Record<string, { title: string; desc: string }> = {
    prelude: { title: '尚无想读的书', desc: '开始规划你的阅读旅程吧' },
    andante: { title: '没有在读书籍', desc: '选一本书开始阅读吧' },
    finale: { title: '尚未读完一本书', desc: '坚持阅读，终章终会到来' },
  }

  const msg = status ? messages[status] : { title: '书架是空的', desc: '添加你的第一本书吧' }

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
        <Library size={64} className="text-[var(--text-muted)] opacity-40" strokeWidth={1} />
      </motion.div>
      <h3 className="text-heading-lg text-[var(--text-primary)] mt-4">{msg.title}</h3>
      <p className="text-body-md text-[var(--text-secondary)] mt-2">{msg.desc}</p>
    </motion.div>
  )
}
