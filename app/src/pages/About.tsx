import { motion } from 'framer-motion'
import { BookOpen, Heart, Mail, Music, Feather, Code2 } from 'lucide-react'

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
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
}

export default function About() {
  return (
    <div className="max-w-[800px] mx-auto py-8 lg:py-12">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className="text-center mb-12"
      >
        <h1
          className="text-[48px] leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)] mb-4"
          style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
        >
          Aria·R
        </h1>
        <p
          className="text-[17px] leading-[1.7] tracking-[0.01em] text-[var(--text-secondary)] mb-3"
          style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
        >
          每一次阅读，都是一场灵魂的共鸣。
        </p>
        <span
          className="inline-block text-[11px] leading-[1.4] tracking-[0.08em] text-[var(--text-muted)] px-3 py-1 rounded-full border border-[var(--border-subtle)]"
          style={{ fontFamily: '"JetBrains Mono", "Courier New", monospace' }}
        >
          v1.0.0
        </span>
      </motion.section>

      {/* Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Project Intro */}
        <motion.div
          variants={itemVariants}
          className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-6 lg:p-8 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-morandi)]/10 flex items-center justify-center">
              <BookOpen className="w-[18px] h-[18px] text-[var(--accent-morandi)]" strokeWidth={1.5} />
            </div>
            <h2
              className="text-[22px] leading-[1.3] tracking-[0.01em] text-[var(--text-primary)]"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              关于 Aria·R
            </h2>
          </div>
          <p
            className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)] mb-4"
            style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
          >
            Aria·R 是一个私人读书知识库，帮助你管理阅读记录、存储读书笔记和摘抄、追踪阅读进度，并提供跨书籍的知识关联与可视化呈现。
          </p>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--accent-warm)]/8 border border-[var(--accent-warm)]/12">
            <Feather className="w-4 h-4 text-[var(--accent-warm)] flex-shrink-0" strokeWidth={1.5} />
            <span
              className="text-[13px] leading-[1.55] text-[var(--accent-warm)] font-medium"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              轻量录入，智能处理
            </span>
          </div>
        </motion.div>

        {/* Name Origin */}
        <motion.div
          variants={itemVariants}
          className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-6 lg:p-8 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-haze)]/10 flex items-center justify-center">
              <Music className="w-[18px] h-[18px] text-[var(--accent-haze)]" strokeWidth={1.5} />
            </div>
            <h2
              className="text-[22px] leading-[1.3] tracking-[0.01em] text-[var(--text-primary)]"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              名字由来
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <span
                className="text-[15px] leading-[1.65] font-semibold text-[var(--accent-morandi)] flex-shrink-0 w-16"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                Aria
              </span>
              <p
                className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)]"
                style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
              >
                咏叹调 — 音乐中抒发情感的独唱段落
              </p>
            </div>
            <div className="flex gap-4">
              <span
                className="text-[15px] leading-[1.65] font-semibold text-[var(--accent-haze)] flex-shrink-0 w-16"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                R
              </span>
              <p
                className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)]"
                style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
              >
                Read — 阅读，核心行为
              </p>
            </div>
            <div className="h-px bg-[var(--border-subtle)] my-3" />
            <div className="flex gap-4">
              <span
                className="text-[15px] leading-[1.65] font-semibold text-[var(--text-primary)] flex-shrink-0 w-16"
                style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
              >
                Aria·R
              </span>
              <p
                className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--accent-morandi)] font-medium"
                style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
              >
                阅读即共鸣
              </p>
            </div>
          </div>
        </motion.div>

        {/* Acknowledgments */}
        <motion.div
          variants={itemVariants}
          className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-6 lg:p-8 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[var(--success)]/10 flex items-center justify-center">
              <Heart className="w-[18px] h-[18px] text-[var(--success)]" strokeWidth={1.5} />
            </div>
            <h2
              className="text-[22px] leading-[1.3] tracking-[0.01em] text-[var(--text-primary)]"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              致谢
            </h2>
          </div>
          <p
            className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)] mb-5"
            style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
          >
            Aria·R 的诞生离不开以下优秀的开源项目：
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'React', desc: 'UI 框架' },
              { name: 'Tailwind CSS', desc: '样式系统' },
              { name: 'D3.js', desc: '数据可视化' },
              { name: 'Framer Motion', desc: '动画引擎' },
            ].map((tech) => (
              <div
                key={tech.name}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--bg-cream)] border border-[var(--border-subtle)]"
              >
                <Code2 className="w-4 h-4 text-[var(--accent-morandi)] flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <div
                    className="text-[13px] font-medium text-[var(--text-primary)]"
                    style={{ fontFamily: '"JetBrains Mono", "Courier New", monospace' }}
                  >
                    {tech.name}
                  </div>
                  <div
                    className="text-[11px] text-[var(--text-muted)]"
                    style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
                  >
                    {tech.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          variants={itemVariants}
          className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] p-6 lg:p-8 shadow-[0_1px_3px_rgba(44,44,44,0.04)]"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-[var(--accent-warm)]/10 flex items-center justify-center">
              <Mail className="w-[18px] h-[18px] text-[var(--accent-warm)]" strokeWidth={1.5} />
            </div>
            <h2
              className="text-[22px] leading-[1.3] tracking-[0.01em] text-[var(--text-primary)]"
              style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
            >
              联系我们
            </h2>
          </div>
          <a
            href="mailto:hello@aria-r.app"
            className="inline-flex items-center gap-2 text-[15px] leading-[1.65] text-[var(--accent-haze)] hover:text-[var(--accent-morandi)] transition-colors duration-200"
            style={{ fontFamily: '"JetBrains Mono", "Courier New", monospace' }}
          >
            <Mail className="w-4 h-4" strokeWidth={1.5} />
            hello@aria-r.app
          </a>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[11px] leading-[1.4] tracking-[0.08em] text-[var(--text-muted)] pt-4"
          style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
        >
          用 ❤ 为阅读者打造
        </motion.p>
      </motion.div>
    </div>
  )
}
