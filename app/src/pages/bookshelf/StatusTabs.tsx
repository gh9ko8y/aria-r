import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReadingStatus } from '@/types';

interface StatusTabsProps {
  activeTab: ReadingStatus;
  onTabChange: (status: ReadingStatus) => void;
  counts: Record<ReadingStatus, number>;
}

const tabs: { key: ReadingStatus; label: string; sub: string }[] = [
  { key: 'prelude', label: '序曲', sub: '想读' },
  { key: 'andante', label: '行板', sub: '在读' },
  { key: 'finale', label: '终章', sub: '已读' },
];

const statusColors: Record<ReadingStatus, { text: string; bg: string; border: string }> = {
  prelude: { text: 'text-[#6B8FAD]', bg: 'bg-[#6B8FAD]/12', border: 'border-[#6B8FAD]' },
  andante: { text: 'text-[#5B7E71]', bg: 'bg-[#5B7E71]/12', border: 'border-[#5B7E71]' },
  finale: { text: 'text-[#7BAE7F]', bg: 'bg-[#7BAE7F]/12', border: 'border-[#7BAE7F]' },
};

export default function StatusTabs({ activeTab, onTabChange, counts }: StatusTabsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="flex justify-center gap-3 mb-8"
    >
      {tabs.map((tab, i) => {
        const colors = statusColors[tab.key];
        const isActive = activeTab === tab.key;
        return (
          <motion.button
            key={tab.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
              'border-2',
              isActive
                ? `${colors.bg} ${colors.text} ${colors.border}`
                : 'bg-[#F0F0F0] text-[#6B6B6B] border-transparent hover:bg-[#E2E0D8]'
            )}
          >
            <span style={{ fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif' }}>
              {tab.label}
            </span>
            <span className="text-xs opacity-70">({counts[tab.key]})</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
