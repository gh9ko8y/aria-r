import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, CheckCircle, Sparkles } from 'lucide-react'

const feedbackTypes = [
  { value: 'feature', label: '功能建议' },
  { value: 'bug', label: 'Bug 报告' },
  { value: 'experience', label: '使用体验' },
  { value: 'other', label: '其他' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

export default function Feedback() {
  const [type, setType] = useState('feature')
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    const feedback = {
      id: crypto.randomUUID(),
      type,
      content: content.trim(),
      email: email.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem('aria-r:feedbacks') || '[]')
    existing.push(feedback)
    localStorage.setItem('aria-r:feedbacks', JSON.stringify(existing))

    setSubmitted(true)
  }

  const handleReset = () => {
    setType('feature')
    setContent('')
    setEmail('')
    setSubmitted(false)
  }

  return (
    <div className="max-w-[800px] mx-auto py-8 lg:py-12">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="text-center mb-10"
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-haze)]/10 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-6 h-6 text-[var(--accent-haze)]" strokeWidth={1.5} />
        </div>
        <h1
          className="text-[36px] leading-[1.2] tracking-[-0.01em] text-[var(--text-primary)] mb-3"
          style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
        >
          反馈与建议
        </h1>
        <p
          className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)]"
          style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
        >
          你的意见会让 Aria·R 变得更好
        </p>
      </motion.section>

      <AnimatePresence mode="wait">
        {submitted ? (
          /* Success State */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-10 lg:p-14 shadow-[0_1px_3px_rgba(44,44,44,0.04)] text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle className="w-8 h-8 text-[var(--success)]" strokeWidth={1.5} />
            </motion.div>
            <h2
              className="text-[22px] leading-[1.3] tracking-[0.01em] text-[var(--text-primary)] mb-3"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              感谢你的反馈！
            </h2>
            <p
              className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)] mb-6"
              style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
            >
              我们会认真阅读每一条建议
              <Sparkles className="w-4 h-4 inline-block ml-1 text-[var(--accent-warm)]" strokeWidth={1.5} />
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-morandi)] text-white text-[14px] font-medium hover:bg-[var(--accent-morandi)]/90 active:scale-[0.97] transition-all duration-150"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              再写一条
            </button>
          </motion.div>
        ) : (
          /* Form */
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
            className="space-y-5"
          >
            {/* Feedback Type */}
            <motion.div
              variants={itemVariants}
              className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-5 lg:p-6 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
            >
              <label
                className="block text-[14px] font-medium text-[var(--text-primary)] mb-4"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                反馈类型
              </label>
              <div className="flex flex-wrap gap-3">
                {feedbackTypes.map((ft) => (
                  <label
                    key={ft.value}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 text-[14px] ${
                      type === ft.value
                        ? 'border-[var(--accent-morandi)] bg-[var(--accent-morandi)]/8 text-[var(--accent-morandi)]'
                        : 'border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--overlay)]'
                    }`}
                    style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
                  >
                    <input
                      type="radio"
                      name="feedbackType"
                      value={ft.value}
                      checked={type === ft.value}
                      onChange={(e) => setType(e.target.value)}
                      className="sr-only"
                    />
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        type === ft.value
                          ? 'border-[var(--accent-morandi)]'
                          : 'border-[var(--text-muted)]'
                      }`}
                    >
                      {type === ft.value && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent-morandi)]"
                        />
                      )}
                    </span>
                    {ft.label}
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              variants={itemVariants}
              className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-5 lg:p-6 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
            >
              <label
                htmlFor="feedback-content"
                className="block text-[14px] font-medium text-[var(--text-primary)] mb-4"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                反馈内容
              </label>
              <textarea
                id="feedback-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请描述你的建议或遇到的问题..."
                rows={6}
                required
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-cream)] border border-[var(--border-subtle)] text-[15px] leading-[1.65] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-morandi)]/30 focus:border-[var(--accent-morandi)] resize-none transition-all duration-200"
                style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
              />
            </motion.div>

            {/* Email */}
            <motion.div
              variants={itemVariants}
              className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-5 lg:p-6 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
            >
              <label
                htmlFor="feedback-email"
                className="block text-[14px] font-medium text-[var(--text-primary)] mb-4"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                联系邮箱
                <span className="text-[var(--text-muted)] font-normal ml-1">（可选）</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg bg-[var(--bg-cream)] border border-[var(--border-subtle)] text-[15px] leading-[1.65] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-morandi)]/30 focus:border-[var(--accent-morandi)] transition-all duration-200"
                style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
              />
            </motion.div>

            {/* Submit */}
            <motion.div variants={itemVariants}>
              <button
                type="submit"
                disabled={!content.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-[10px] bg-[var(--accent-morandi)] text-white text-[16px] font-medium hover:bg-[var(--accent-morandi)]/90 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 transition-all duration-150 shadow-[0_1px_3px_rgba(44,44,44,0.08)]"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                <Send className="w-[18px] h-[18px]" strokeWidth={1.5} />
                发送反馈
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
