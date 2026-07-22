import { NavLink, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
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
  Edit3,
} from 'lucide-react'

// ─── Desktop nav items ────────────────────────────────────────────
const desktopNavItems = [
  { path: '/', label: 'Aria·R', icon: BookOpen },
  { path: '/bookshelf', label: '我的书架', icon: Library },
  { path: '/record', label: '记录', icon: Edit3 },
  { path: '/excerpts', label: '摘录集', icon: Quote },
  { path: '/essays', label: '随笔', icon: PenLine },
  { path: '/echoes', label: '回响', icon: RotateCcw },
  { path: '/graph', label: '共鸣图谱', icon: GitGraph },
  { path: '/playlist', label: '曲目清单', icon: ListMusic },
  { path: '/timeline', label: '时间线', icon: Clock },
  { path: '/profile', label: '我的', icon: User },
]

// ─── Mobile: Fixed + Scrollable items ────────────────────────────
const mobileFixedLeft = { path: '/', label: '首页', icon: BookOpen }
const mobileScrollItems = [
  { path: '/bookshelf', label: '书架', icon: Library },
  { path: '/record', label: '记录', icon: Edit3 },
  { path: '/excerpts', label: '摘录', icon: Quote },
  { path: '/echoes', label: '回响', icon: RotateCcw },
  { path: '/graph', label: '图谱', icon: GitGraph },
  { path: '/playlist', label: '曲目', icon: ListMusic },
  { path: '/timeline', label: '时间线', icon: Clock },
]
const mobileFixedRight = { path: '/profile', label: '我的', icon: User }

// Check if a path is active (handles record group)
function useActivePath() {
  const location = useLocation()
  return (path: string) => {
    if (path === '/') return location.pathname === '/'
    if (path === '/record') {
      return location.pathname === '/record' ||
        location.pathname === '/excerpts' ||
        location.pathname === '/essays'
    }
    return location.pathname.startsWith(path)
  }
}

// ─── Desktop Sidebar Nav Item ────────────────────────────────────
function DesktopNavItem({
  item,
  isActive,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: { path: string; label: string; icon: React.ComponentType<any> }
  isActive: boolean
}) {
  const Icon = item.icon
  return (
    <NavLink
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
}

// ─── Mobile Nav Button ───────────────────────────────────────────
function MobileNavButton({
  item,
  isActive,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: { path: string; label: string; icon: React.ComponentType<any> }
  isActive: boolean
}) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      className="relative flex flex-col items-center justify-center gap-0.5 h-[60px] min-w-[56px] px-2"
    >
      <motion.div
        animate={{ scale: isActive ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Icon
          size={isActive ? 24 : 22}
          strokeWidth={isActive ? 2 : 1.5}
          className={isActive ? 'text-[var(--accent-morandi)]' : 'text-[#999999]'}
        />
      </motion.div>
      <span
        className="text-[10px] transition-colors"
        style={{
          color: isActive ? 'var(--accent-morandi)' : '#999999',
          fontWeight: isActive ? 500 : 400,
        }}
      >
        {item.label}
      </span>
      {isActive && (
        <motion.div
          layoutId="mobileNavDot"
          className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[var(--accent-morandi)]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </NavLink>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Navbar() {
  const isActive = useActivePath()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(true)

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeftFade(el.scrollLeft > 8)
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8)
  }

  useEffect(() => {
    handleScroll()
  }, [])

  return (
    <>
      {/* ═══════════════════════════════════════════
          DESKTOP: Left Sidebar (all items vertical)
      ═══════════════════════════════════════════ */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] flex-col bg-[var(--bg-paper)] border-r border-[var(--border-subtle)] z-50">
        <div className="p-6 flex items-center gap-3">
          <img src="/icon.png" alt="Aria·R" className="h-8 w-8 rounded-lg" />
        </div>
        <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto">
          {desktopNavItems.map((item) => (
            <DesktopNavItem key={item.path} item={item} isActive={isActive(item.path)} />
          ))}
        </nav>
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)] text-center">Aria·R v2.0</div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════
          MOBILE: Bottom Fixed + Scrollable Nav
      ═══════════════════════════════════════════ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-cream)]/70 backdrop-blur-xl border-t border-[var(--border-subtle)]/50">
        <div className="flex items-center h-[60px]">
          {/* ─── Fixed Left: 首页 ─── */}
          <div className="flex-shrink-0 w-[60px] flex items-center justify-center border-r border-[var(--border-subtle)]/30">
            <MobileNavButton item={mobileFixedLeft} isActive={isActive('/')} />
          </div>

          {/* ─── Scrollable Center ─── */}
          <div className="flex-1 relative overflow-hidden">
            {/* Left fade */}
            <AnimatePresence>
              {showLeftFade && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 top-0 bottom-0 w-5 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to right, var(--bg-cream), transparent)' }}
                />
              )}
            </AnimatePresence>
            {/* Right fade */}
            <AnimatePresence>
              {showRightFade && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-0 top-0 bottom-0 w-5 z-10 pointer-events-none"
                  style={{ background: 'linear-gradient(to left, var(--bg-cream), transparent)' }}
                />
              )}
            </AnimatePresence>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex items-center overflow-x-auto"
              style={{
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {mobileScrollItems.map((item) => (
                <div key={item.path} className="flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
                  <MobileNavButton item={item} isActive={isActive(item.path)} />
                </div>
              ))}
            </div>
          </div>

          {/* ─── Fixed Right: 我的 ─── */}
          <div className="flex-shrink-0 w-[60px] flex items-center justify-center border-l border-[var(--border-subtle)]/30">
            <MobileNavButton item={mobileFixedRight} isActive={isActive('/profile')} />
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--bg-cream)]/70 backdrop-blur-xl border-b border-[var(--border-subtle)]/50 z-50 flex items-center justify-between px-4">
        <img src="/icon.png" alt="Aria·R" className="h-7 w-7 rounded-md" />
      </div>
    </>
  )
}
