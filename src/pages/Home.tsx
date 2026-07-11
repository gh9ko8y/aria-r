import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Quote, RotateCcw, GitGraph, ListMusic } from 'lucide-react'
import { getCurrentlyReading, getRecentExcerpts, getReadingStats } from '@/lib/storage'
import type { Book, Excerpt } from '@/types'

export default function Home() {
  const [currentlyReading, setCurrentlyReading] = useState<Book[]>([])
  const [recentExcerpts, setRecentExcerpts] = useState<Excerpt[]>([])
  const [stats, setStats] = useState({ totalBooks: 0, currentlyReading: 0, totalExcerpts: 0, finishedThisMonth: 0 })

  useEffect(() => {
    setCurrentlyReading(getCurrentlyReading())
    setRecentExcerpts(getRecentExcerpts(3))
    setStats(getReadingStats())
  }, [])

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-display-xl text-[var(--text-primary)] mb-2"
        >
          今天，读了什么？
        </motion.h1>
        <p className="text-body-md text-[var(--text-secondary)]">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '在读', value: stats.currentlyReading, icon: BookOpen, color: 'var(--accent-morandi)' },
          { label: '本月已读', value: stats.finishedThisMonth, icon: RotateCcw, color: 'var(--success)' },
          { label: '摘录', value: stats.totalExcerpts, icon: Quote, color: 'var(--accent-haze)' },
          { label: '藏书', value: stats.totalBooks, icon: ListMusic, color: 'var(--accent-warm)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card-surface p-4"
          >
            <stat.icon size={20} style={{ color: stat.color }} strokeWidth={1.5} />
            <div className="mt-2 text-2xl font-semibold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-body-sm text-[var(--text-muted)]">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Currently Reading */}
      {currentlyReading.length > 0 && (
        <section>
          <h2 className="text-heading-lg text-[var(--text-primary)] mb-4">行板中...</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentlyReading.map((book, i) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="card-surface p-4"
              >
                <div className="flex gap-3">
                  {book.cover ? (
                    <img src={book.cover} alt={book.title} className="w-16 h-24 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-24 bg-[var(--bg-paper)] rounded-lg flex items-center justify-center">
                      <BookOpen size={24} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-heading-lg truncate">{book.title}</h3>
                    <p className="text-body-sm text-[var(--text-secondary)]">{book.author}</p>
                    <div className="mt-2">
                      <div className="h-1 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${book.progress}%`, background: 'var(--accent-morandi)' }}
                        />
                      </div>
                      <span className="text-label mt-1 inline-block">{book.progress}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Excerpts */}
      {recentExcerpts.length > 0 && (
        <section>
          <h2 className="text-heading-lg text-[var(--text-primary)] mb-4">最近摘录</h2>
          <div className="space-y-3">
            {recentExcerpts.map((excerpt, i) => (
              <motion.div
                key={excerpt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="excerpt-card"
              >
                <p className="text-body-lg italic text-[var(--text-primary)]">「{excerpt.content}」</p>
                {excerpt.thought && (
                  <p className="text-body-md text-[var(--text-secondary)] mt-2">{excerpt.thought}</p>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="flex flex-wrap gap-3">
        <a href="#/bookshelf" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-morandi)] text-white text-sm hover:opacity-90 transition-opacity">
          <BookOpen size={16} /> 添加书籍
        </a>
        <a href="#/excerpts" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-haze)] text-white text-sm hover:opacity-90 transition-opacity">
          <Quote size={16} /> 添加摘录
        </a>
        <a href="#/graph" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-warm)] text-white text-sm hover:opacity-90 transition-opacity">
          <GitGraph size={16} /> 查看图谱
        </a>
      </section>
    </div>
  )
}
