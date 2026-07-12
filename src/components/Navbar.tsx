import { NavLink, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Library,
  Quote,
  PenLine,
  RotateCcw,
  GitGraph,
  ListMusic,
  Clock,
  User,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Aria·R', icon: BookOpen },
  { path: '/bookshelf', label: '我的书架', icon: Library },
  { path: '/excerpts', label: '摘录集', icon: Quote },
  { path: '/essays', label: '随笔', icon: PenLine },
  { path: '/echoes', label: '回响', icon: RotateCcw },
  { path: '/graph', label: '共鸣图谱', icon: GitGraph },
  { path: '/playlist', label: '曲目清单', icon: ListMusic },
  { path: '/timeline', label: '时间线', icon: Clock },
  { path: '/profile', label: '我的', icon: User },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] flex-col bg-[var(--bg-paper)] border-r border-[var(--border-subtle)] z-50">
        <div className="p-6 flex items-center gap-3">
          <img src="/logo-mark.svg" alt="Aria·R" className="h-8 w-auto" />
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'text-[var(--accent-morandi)] bg-[var(--accent-morandi)]/10 font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[var(--accent-morandi)] rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] text-center">Aria·R v2.0</div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-[var(--bg-cream)] border-t border-[var(--border-subtle)] z-50 flex items-center justify-around px-2 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 w-14 h-14"
            >
              <AnimatePresence mode="wait">
                {isActive ? (
                  <motion.div key="active" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                    <Icon size={22} strokeWidth={1.5} className="text-[var(--accent-morandi)]" />
                  </motion.div>
                ) : (
                  <Icon size={22} strokeWidth={1.5} className="text-[var(--text-muted)]" />
                )}
              </AnimatePresence>
              <span className={`text-[10px] ${isActive ? 'text-[var(--accent-morandi)] font-medium' : 'text-[var(--text-muted)]'}`}>
                {item.label === 'Aria·R' ? '首页' : item.label}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-cream)] border-b border-[var(--border-subtle)] z-50 flex items-center justify-between px-4">
        <img src="/logo-mark.svg" alt="Aria·R" className="h-7 w-auto" />
      </div>
    </>
  )
}
