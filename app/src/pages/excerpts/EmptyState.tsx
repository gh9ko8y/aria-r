import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="flex flex-col items-center justify-center py-24 px-4"
    >
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.35 }}
        >
          <rect x="45" y="35" width="55" height="130" rx="3" stroke="#9B9B8E" strokeWidth="2.5" fill="none" />
          <rect x="100" y="35" width="55" height="130" rx="3" stroke="#9B9B8E" strokeWidth="2.5" fill="none" />
          <line x1="100" y1="42" x2="100" y2="158" stroke="#9B9B8E" strokeWidth="2.5" />
          <line x1="60" y1="58" x2="85" y2="58" stroke="#9B9B8E" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="72" x2="85" y2="72" stroke="#9B9B8E" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="86" x2="80" y2="86" stroke="#9B9B8E" strokeWidth="2" strokeLinecap="round" />
          <line x1="115" y1="58" x2="140" y2="58" stroke="#9B9B8E" strokeWidth="2" strokeLinecap="round" />
          <line x1="115" y1="72" x2="140" y2="72" stroke="#9B9B8E" strokeWidth="2" strokeLinecap="round" />
          <line x1="115" y1="86" x2="140" y2="86" stroke="#9B9B8E" strokeWidth="2" strokeLinecap="round" />
          <line x1="60" y1="115" x2="140" y2="115" stroke="#9B9B8E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
          <line x1="60" y1="128" x2="120" y2="128" stroke="#9B9B8E" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" />
          <rect x="148" y="150" width="38" height="6" rx="3" stroke="#9B9B8E" strokeWidth="2" fill="none" transform="rotate(-15 148 150)" />
          <rect x="155" y="145" width="4" height="20" rx="2" stroke="#9B9B8E" strokeWidth="2" fill="none" transform="rotate(-15 155 145)" />
        </svg>
      </motion.div>

      <h3
        className="text-xl mb-2"
        style={{
          fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
          color: '#2C2C2C',
          letterSpacing: '0.01em',
        }}
      >
        还没有摘录
      </h3>

      <p
        className="text-sm mb-6"
        style={{
          color: '#6B6B6B',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1.55,
        }}
      >
        开始记录让你心动的句子吧
      </p>

      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-white text-sm font-medium transition-all duration-150 hover:brightness-105 hover:scale-[1.02] active:scale-[0.97]"
        style={{ backgroundColor: '#5B7E71' }}
      >
        <Plus className="w-4 h-4" />
        记录第一条摘录
      </button>
    </motion.div>
  );
}
