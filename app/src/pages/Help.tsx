import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: '什么是"序曲""行板""终章"？',
    answer:
      '这是我们对阅读状态的命名——序曲代表想读，行板代表正在读，终章代表已读完。就像一首乐曲，每本书都有它的开始、进行和结束。',
  },
  {
    question: '如何快速添加摘录？',
    answer:
      '在书籍详情页点击右下角的 ✍️ 按钮，或者使用语音输入，说出你想记录的句子。',
  },
  {
    question: '共鸣图谱是什么？',
    answer:
      '共鸣图谱是展示书籍之间关联的可视化工具。它会自动发现不同书籍之间的共同主题、相似概念，帮你建立知识网络。',
  },
  {
    question: '阅读时间线怎么用？',
    answer:
      '阅读时间线用甘特图形式展示你的阅读轨迹。你可以切换日/周/月/年视图，点击某一天查看当天的阅读记录和摘录。',
  },
  {
    question: '随笔和摘录有什么区别？',
    answer:
      '摘录是书中打动你的句子，有明确的来源；随笔是你自己的灵感和随想，可以图文混排，记录生活中的点滴。',
  },
  {
    question: '如何导出我的数据？',
    answer:
      '进入"我的" → "数据导出"，选择导出格式（Markdown/JSON），系统会打包下载你的所有数据。',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
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

function AccordionItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: { question: string; answer: string }
  index: number
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-[var(--bg-card)] rounded-[10px] border border-[var(--border-subtle)] shadow-[0_1px_3px_rgba(44,44,44,0.04)] overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5 text-left hover:bg-[var(--overlay)] transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3 pr-4">
          <span
            className="text-[11px] leading-[1.4] tracking-[0.08em] text-[var(--accent-morandi)] mt-1 flex-shrink-0"
            style={{ fontFamily: '"JetBrains Mono", "Courier New", monospace' }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3
            className="text-[16px] leading-[1.4] tracking-[0.01em] text-[var(--text-primary)] font-medium"
            style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
          >
            {faq.question}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown
            className={`w-5 h-5 transition-colors duration-200 ${isOpen ? 'text-[var(--accent-morandi)]' : 'text-[var(--text-muted)]'}`}
            strokeWidth={1.5}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
              opacity: { duration: 0.2 },
            }}
          >
            <div className="px-5 pb-5 lg:px-6 lg:pb-6 pt-0">
              <div className="h-px bg-[var(--border-subtle)] mb-4 ml-8" />
              <p
                className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)] ml-8"
                style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
              >
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
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
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-morandi)]/10 flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-6 h-6 text-[var(--accent-morandi)]" strokeWidth={1.5} />
        </div>
        <h1
          className="text-[36px] leading-[1.2] tracking-[-0.01em] text-[var(--text-primary)] mb-3"
          style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
        >
          帮助中心
        </h1>
        <p
          className="text-[15px] leading-[1.65] tracking-[0.01em] text-[var(--text-secondary)]"
          style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
        >
          这里有一些常见问题的解答
        </p>
      </motion.section>

      {/* FAQ Accordion */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            faq={faq}
            index={index}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </motion.div>

      {/* Bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="text-center text-[13px] leading-[1.55] text-[var(--text-muted)] mt-8"
        style={{ fontFamily: '"Source Han Serif CN", "Songti SC", SimSun, serif' }}
      >
        还有其他问题？欢迎通过反馈页面与我们联系。
      </motion.p>
    </div>
  )
}
