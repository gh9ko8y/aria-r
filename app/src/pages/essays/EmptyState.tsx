import { motion } from 'framer-motion';
import { PenLine } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Floating Illustration */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="w-40 h-40 flex items-center justify-center text-[#9B9B8E]/40">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Notebook */}
            <rect x="50" y="30" width="100" height="140" rx="6" stroke="currentColor" strokeWidth="2.5" />
            {/* Spiral binding */}
            <line x1="70" y1="30" x2="70" y2="170" stroke="currentColor" strokeWidth="2" strokeDasharray="8 6" />
            {/* Lines */}
            <line x1="82" y1="60" x2="130" y2="60" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="82" y1="80" x2="130" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="82" y1="100" x2="120" y2="100" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="82" y1="120" x2="130" y2="120" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="82" y1="140" x2="110" y2="140" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            {/* Pen */}
            <line x1="145" y1="25" x2="155" y2="45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="142,20 148,28 140,30" fill="currentColor" opacity="0.4" />
            {/* Floating spark */}
            <circle cx="100" cy="12" r="3" fill="currentColor" opacity="0.3">
              <animate attributeName="cy" values="12;20;12" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      </motion.div>

      {/* Text */}
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-[22px] font-medium text-[#2C2C2C] mb-2"
        style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}
      >
        还没有随笔
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-[15px] text-[#6B6B6B] mb-6"
      >
        记录点什么灵感吧
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B7E71] text-white rounded-[10px] text-sm font-medium hover:brightness-105 hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer"
      >
        <PenLine size={16} />
        写第一篇随笔
      </motion.button>
    </motion.div>
  );
}
