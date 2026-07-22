import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onAddBook: () => void;
}

export default function EmptyState({ onAddBook }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Floating Book Illustration */}
      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6"
      >
        <div className="w-40 h-40 flex items-center justify-center text-[#9B9B8E]/40">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="40" y="30" width="55" height="140" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <rect x="105" y="30" width="55" height="140" rx="4" stroke="currentColor" strokeWidth="2.5" />
            <line x1="67.5" y1="30" x2="67.5" y2="170" stroke="currentColor" strokeWidth="2.5" />
            <line x1="132.5" y1="30" x2="132.5" y2="170" stroke="currentColor" strokeWidth="2.5" />
            <line x1="50" y1="55" x2="85" y2="55" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="50" y1="70" x2="80" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="115" y1="55" x2="150" y2="55" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <line x1="115" y1="70" x2="145" y2="70" stroke="currentColor" strokeWidth="2" opacity="0.5" />
            <circle cx="100" cy="15" r="3" fill="currentColor" opacity="0.3">
              <animate attributeName="cy" values="15;25;15" dur="3s" repeatCount="indefinite" />
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
        这里还没有书
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-[15px] text-[#6B6B6B] mb-6"
      >
        开始构建你的私人图书馆吧
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        onClick={onAddBook}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B7E71] text-white rounded-[10px] text-sm font-medium hover:brightness-105 hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer"
      >
        <BookOpen size={16} />
        添加第一本书
      </motion.button>
    </motion.div>
  );
}
