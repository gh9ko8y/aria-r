import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Quote, PenLine, BookOpen } from 'lucide-react'

export default function Record() {
  const navigate = useNavigate()

  const options = [
    {
      icon: Quote,
      title: '写摘录',
      desc: '记录书中打动你的句子',
      color: '#5B7E71',
      action: () => navigate('/excerpts'),
    },
    {
      icon: PenLine,
      title: '写随笔',
      desc: '记录你的灵感与随想',
      color: '#6B8FAD',
      action: () => navigate('/essays'),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="min-h-[60vh] flex flex-col items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#5B7E71]/10 mb-4">
          <BookOpen size={24} className="text-[#5B7E71]" strokeWidth={1.5} />
        </div>
        <h1 className="text-display-lg text-[#2C2C2C] mb-2" style={{ fontFamily: '"LXGW WenKai", sans-serif' }}>
          记录
        </h1>
        <p className="text-body-md text-[#6B6B6B]">选择一种方式，记录你的阅读时光</p>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        {options.map((opt, i) => (
          <motion.button
            key={opt.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={opt.action}
            className="w-full flex items-center gap-5 p-6 rounded-2xl border border-[#E2E0D8] bg-[#F0F0F0] text-left transition-shadow hover:shadow-lg"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: opt.color + '15' }}>
              <opt.icon size={28} style={{ color: opt.color }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-heading-lg mb-1" style={{ color: opt.color, fontFamily: '"LXGW WenKai", sans-serif' }}>
                {opt.title}
              </h3>
              <p className="text-body-sm text-[#6B6B6B]">{opt.desc}</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#9B9B8E] flex-shrink-0">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </motion.button>
        ))}
      </div>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-10 text-body-sm text-[#9B9B8E] text-center">
        你也可以在书籍详情页中快速添加摘录
      </motion.p>
    </motion.div>
  )
}
