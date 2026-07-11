import { motion } from 'framer-motion'
import type { BookStatus } from '@/types'

const tabs: { key: BookStatus; label: string }[] = [
  { key: 'prelude', label: '序曲' },
  { key: 'andante', label: '行板' },
  { key: 'finale', label: '终章' },
]

const statusClasses: Record<BookStatus, string> = {
  prelude: 'status-prelude',
  andante: 'status-andante',
  finale: 'status-finale',
}

interface StatusTabsProps {
  active: BookStatus
  onChange: (status: BookStatus) => void
  counts: Record<BookStatus, number>
}

export default function StatusTabs({ active, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
            active === tab.key
              ? 'ring-2 ring-[var(--border-active)]'
              : 'hover:bg-[var(--overlay)]'
          }`}
        >
          <span className={`status-badge ${statusClasses[tab.key]}`}>
            {tab.label}
          </span>
          <span className="text-body-sm text-[var(--text-muted)]">
            {counts[tab.key]}
          </span>
          {active === tab.key && (
            <motion.div
              layoutId="statusIndicator"
              className="absolute inset-0 rounded-lg bg-[var(--overlay)]"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  )
}
