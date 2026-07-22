import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  User,
  BookOpen,
  Library,
  FileText,
  Sun,
  Moon,
  Type,
  Bell,
  Download,
  Upload,
  Info,
  LogOut,
  ChevronRight,
  ChevronDown,
  Edit3,
  Settings2,
  Bookmark,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/types';
import { useDarkMode } from '@/hooks/use-dark-mode';
import {
  getUser,
  saveUser,
  getReadingStats,
  getBooks,
  getExcerpts,
  getEssays,
  getTags,
  getCharacters,
  getKnowledgeLinks,
  getReadingLogs,
  getReadingGoals,
  saveBooks,
  saveExcerpts,
  saveEssays,
  saveTags,
  saveCharacters,
  saveKnowledgeLinks,
  saveReadingLogs,
  saveReadingGoals,
} from '@/lib/storage';

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

interface StatCard {
  key: string;
  label: string;
  value: number;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  path: string;
}

/* ──────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

/* ──────────────────────────────────────────────
   Data Import / Export
   ────────────────────────────────────────────── */

function exportData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    books: getBooks(),
    excerpts: getExcerpts(),
    essays: getEssays(),
    tags: getTags(),
    characters: getCharacters(),
    knowledgeLinks: getKnowledgeLinks(),
    readingLogs: getReadingLogs(),
    readingGoals: getReadingGoals(),
    user: getUser(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aria-r-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(): Promise<number> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { reject(new Error('未选择文件')); return; }

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.books && !data.excerpts) {
          reject(new Error('无效的备份文件'));
          return;
        }

        let count = 0;
        if (data.books) { saveBooks(data.books); count += data.books.length; }
        if (data.excerpts) { saveExcerpts(data.excerpts); count += data.excerpts.length; }
        if (data.essays) { saveEssays(data.essays); count += data.essays.length; }
        if (data.tags) saveTags(data.tags);
        if (data.characters) saveCharacters(data.characters);
        if (data.knowledgeLinks) saveKnowledgeLinks(data.knowledgeLinks);
        if (data.readingLogs) saveReadingLogs(data.readingLogs);
        if (data.readingGoals) saveReadingGoals(data.readingGoals);
        if (data.user) saveUser(data.user);

        resolve(count);
      } catch (e) {
        reject(e);
      }
    };
    input.click();
  });
}

/* ──────────────────────────────────────────────
   Collapsible Section Component
   ────────────────────────────────────────────── */

function CollapsibleSection({
  icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[#E2E0D8] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-[rgba(44,44,44,0.02)] transition-colors"
      >
        {icon}
        <span className="flex-1 text-left text-[14px] text-[#2C2C2C] font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} strokeWidth={1.5} className="text-[#9B9B8E]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(getUser);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getUser());

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
    setIsLoggedIn(!!currentUser);
  }, []);

  const [editingNickname, setEditingNickname] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nicknameDraft, setNicknameDraft] = useState(user?.nickname || '');
  const [bioDraft, setBioDraft] = useState(user?.bio || '');

  // Settings state
  const { dark: darkMode, toggle: toggleDark } = useDarkMode();
  const [fontSize, setFontSize] = useState(15);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);

  // Save nickname
  const saveNickname = useCallback(() => {
    if (!user) return;
    const trimmed = nicknameDraft.trim();
    if (!trimmed) return;
    const updated = { ...user, nickname: trimmed, updatedAt: new Date().toISOString() };
    saveUser(updated);
    setUser(updated);
    setEditingNickname(false);
  }, [user, nicknameDraft]);

  // Save bio
  const saveBio = useCallback(() => {
    if (!user) return;
    const trimmed = bioDraft.trim();
    if (trimmed.length > 100) return;
    const updated = { ...user, bio: trimmed, updatedAt: new Date().toISOString() };
    saveUser(updated);
    setUser(updated);
    setEditingBio(false);
  }, [user, bioDraft]);

  // Update gender
  const updateGender = useCallback(
    (gender: UserType['gender']) => {
      if (!user) return;
      const updated = { ...user, gender, updatedAt: new Date().toISOString() };
      saveUser(updated);
      setUser(updated);
    },
    [user]
  );

  // Stats
  const stats = isLoggedIn ? getReadingStats() : { finaleCount: 0, currentlyReading: 0, preludeCount: 0, totalEssays: 0 };

  const statCards: StatCard[] = [
    {
      key: 'finished',
      label: '已读完',
      value: stats.finaleCount,
      icon: BookOpen,
      color: 'text-[#7BAE7F]',
      bg: 'bg-[#7BAE7F]/10',
      path: '/bookshelf',
    },
    {
      key: 'reading',
      label: '在读中',
      value: stats.currentlyReading,
      icon: Library,
      color: 'text-[#5B7E71]',
      bg: 'bg-[#5B7E71]/10',
      path: '/bookshelf',
    },
    {
      key: 'prelude',
      label: '想读',
      value: stats.preludeCount,
      icon: Bookmark,
      color: 'text-[#6B8FAD]',
      bg: 'bg-[#6B8FAD]/10',
      path: '/bookshelf',
    },
    {
      key: 'essays',
      label: '随笔',
      value: stats.totalEssays,
      icon: FileText,
      color: 'text-[#A67C52]',
      bg: 'bg-[#A67C52]/10',
      path: '/excerpts',
    },
  ];

  const genderOptions: { value: UserType['gender']; label: string }[] = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' },
  ];

  // Not logged in state
  if (!isLoggedIn) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6 max-w-[800px]"
      >
        <motion.div variants={itemVariants}>
          <h1
            className="text-[28px] leading-[1.25] font-bold text-[#2C2C2C]"
            style={{
              fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
            }}
          >
            我的
          </h1>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-[#F0F0F0] rounded-[10px] border border-[#E2E0D8] p-8"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-[#5B7E71]/10 flex items-center justify-center mb-4">
              <User size={36} strokeWidth={1.5} className="text-[#5B7E71]" />
            </div>
            <h2
              className="text-[20px] font-bold text-[#2C2C2C] mb-2"
              style={{
                fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              未登录
            </h2>
            <p className="text-[14px] text-[#6B6B6B] mb-6">
              登录后即可管理你的阅读数据
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#5B7E71] text-white text-[15px] font-medium hover:bg-[#4A6A5F] transition-colors"
            >
              <LogIn size={18} strokeWidth={1.5} />
              登录 / 注册
            </motion.button>
          </div>
        </motion.div>

        {/* Settings section for non-logged in users */}
        <motion.div variants={itemVariants}>
          <div className="bg-[#F0F0F0] rounded-[10px] border border-[#E2E0D8] overflow-hidden">
            <CollapsibleSection
              icon={<Settings2 size={16} strokeWidth={1.5} className="text-[#6B6B6B]" />}
              title="设置"
              defaultOpen={false}
            >
              <div className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon size={18} strokeWidth={1.5} className="text-[#6B8FAD]" />
                    ) : (
                      <Sun size={18} strokeWidth={1.5} className="text-[#A67C52]" />
                    )}
                    <span className="text-[14px] text-[#2C2C2C]">主题</span>
                  </div>
                  <button
                    onClick={toggleDark}
                    className={cn(
                      'relative w-12 h-7 rounded-full transition-colors duration-300',
                      darkMode ? 'bg-[#5B7E71]' : 'bg-[#E2E0D8]'
                    )}
                  >
                    <motion.div
                      className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                      animate={{ left: darkMode ? 26 : 4 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              icon={<Info size={16} strokeWidth={1.5} className="text-[#A67C52]" />}
              title="关于"
              defaultOpen={false}
            >
              <button
                onClick={() => navigate('/about')}
                className="w-full flex items-center justify-between py-2 text-[14px] text-[#2C2C2C] hover:text-[#5B7E71] transition-colors"
              >
                <span>关于 Aria·R</span>
                <ChevronRight size={16} strokeWidth={1.5} className="text-[#9B9B8E]" />
              </button>
              <button
                onClick={() => navigate('/help')}
                className="w-full flex items-center justify-between py-2 text-[14px] text-[#2C2C2C] hover:text-[#5B7E71] transition-colors"
              >
                <span>帮助中心</span>
                <ChevronRight size={16} strokeWidth={1.5} className="text-[#9B9B8E]" />
              </button>
            </CollapsibleSection>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Logged in state
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-[800px]"
    >
      {/* ── Page Header ── */}
      <motion.div variants={itemVariants}>
        <h1
          className="text-[28px] leading-[1.25] font-bold text-[#2C2C2C]"
          style={{
            fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
          }}
        >
          我的
        </h1>
        <p className="text-[13px] leading-[1.55] text-[#6B6B6B] mt-1">
          管理个人信息与应用设置
        </p>
      </motion.div>

      {/* ── Personal Info Card ── */}
      <motion.div
        variants={itemVariants}
        className="bg-[#F0F0F0] rounded-[10px] border border-[#E2E0D8] overflow-hidden"
      >
        {/* Avatar + Basic info */}
        <div className="p-6 flex items-start gap-4">
          {/* Avatar with upload */}
          <div className="relative shrink-0">
            <label className="block w-20 h-20 rounded-full bg-[#5B7E71]/10 flex items-center justify-center border-2 border-dashed border-[#5B7E71]/30 cursor-pointer hover:border-[#5B7E71]/60 transition-colors overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={32} strokeWidth={1.5} className="text-[#5B7E71]" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    alert('图片大小不能超过 10MB');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const avatar = event.target?.result as string;
                    if (user) {
                      const updated = { ...user, avatar, updatedAt: new Date().toISOString() };
                      saveUser(updated);
                      setUser(updated);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#F0F0F0] border border-[#E2E0D8] flex items-center justify-center pointer-events-none">
              <Edit3 size={12} strokeWidth={1.5} className="text-[#6B6B6B]" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            {/* Nickname - auto-save on blur */}
            <div>
              {editingNickname ? (
                <input
                  type="text"
                  value={nicknameDraft}
                  onChange={(e) => setNicknameDraft(e.target.value)}
                  onBlur={() => {
                    const trimmed = nicknameDraft.trim();
                    if (trimmed && trimmed !== user?.nickname) {
                      saveNickname();
                    } else {
                      setEditingNickname(false);
                      setNicknameDraft(user?.nickname || '');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveNickname();
                    if (e.key === 'Escape') {
                      setEditingNickname(false);
                      setNicknameDraft(user?.nickname || '');
                    }
                  }}
                  autoFocus
                  maxLength={20}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#5B7E71] bg-white text-[18px] font-semibold text-[#2C2C2C] outline-none focus:ring-2 focus:ring-[#5B7E71]/20"
                  style={{
                    fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h2
                    className="text-[22px] leading-[1.3] font-bold text-[#2C2C2C] truncate"
                    style={{
                      fontFamily: 'LXGW WenKai, "PingFang SC", "Microsoft YaHei", sans-serif',
                    }}
                  >
                    {user?.nickname || '读者'}
                  </h2>
                  <button
                    onClick={() => setEditingNickname(true)}
                    className="p-1 rounded-md text-[#9B9B8E] hover:text-[#6B6B6B] hover:bg-[rgba(44,44,44,0.04)] transition-colors shrink-0"
                  >
                    <Edit3 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Bio - auto-save on blur */}
            <div>
              {editingBio ? (
                <div>
                  <textarea
                    value={bioDraft}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) setBioDraft(e.target.value);
                    }}
                    onBlur={() => {
                      const trimmed = bioDraft.trim();
                      if (trimmed !== (user?.bio || '')) {
                        saveBio();
                      } else {
                        setEditingBio(false);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setEditingBio(false);
                        setBioDraft(user?.bio || '');
                      }
                    }}
                    autoFocus
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-[#5B7E71] bg-white text-[13px] text-[#2C2C2C] outline-none focus:ring-2 focus:ring-[#5B7E71]/20 resize-none"
                  />
                  <div className="text-[11px] text-[#9B9B8E] mt-1 text-right">
                    {bioDraft.length}/100
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-[13px] text-[#6B6B6B] leading-[1.55]">
                    {user?.bio || '添加个人签名...'}
                  </p>
                  <button
                    onClick={() => setEditingBio(true)}
                    className="p-1 rounded-md text-[#9B9B8E] hover:text-[#6B6B6B] hover:bg-[rgba(44,44,44,0.04)] transition-colors shrink-0"
                  >
                    <Edit3 size={12} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Gender */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#9B9B8E] uppercase tracking-wider">
                性别
              </span>
              <div className="flex gap-1">
                {genderOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateGender(opt.value)}
                    className={cn(
                      'px-3 py-1 rounded-md text-[12px] font-medium transition-all duration-200',
                      user?.gender === opt.value
                        ? 'bg-[#5B7E71]/10 text-[#5B7E71]'
                        : 'text-[#9B9B8E] hover:text-[#6B6B6B] hover:bg-[rgba(44,44,44,0.04)]'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Overview ── */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.key}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(44,44,44,0.08)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(card.path)}
                className="bg-[#F0F0F0] rounded-[10px] p-4 border border-[#E2E0D8] text-left hover:shadow-[0_4px_12px_rgba(44,44,44,0.06)] transition-all duration-300"
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
                    card.bg
                  )}
                >
                  <Icon size={20} strokeWidth={1.5} className={card.color} />
                </div>
                <div className="text-[24px] font-bold text-[#2C2C2C] leading-tight">
                  {card.value}
                </div>
                <div className="text-[12px] text-[#6B6B6B] mt-0.5">{card.label}</div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ── Settings Section (Collapsible) ── */}
      <motion.div variants={itemVariants}>
        <div className="bg-[#F0F0F0] rounded-[10px] border border-[#E2E0D8] overflow-hidden">
          {/* Theme */}
          <CollapsibleSection
            icon={darkMode ? <Moon size={16} strokeWidth={1.5} className="text-[#6B8FAD]" /> : <Sun size={16} strokeWidth={1.5} className="text-[#A67C52]" />}
            title="主题设置"
            defaultOpen={false}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#2C2C2C]">深色模式</span>
              <button
                onClick={toggleDark}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-colors duration-300',
                  darkMode ? 'bg-[#5B7E71]' : 'bg-[#E2E0D8]'
                )}
              >
                <motion.div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ left: darkMode ? 26 : 4 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </CollapsibleSection>

          {/* Font Size */}
          <CollapsibleSection
            icon={<Type size={16} strokeWidth={1.5} className="text-[#5B7E71]" />}
            title="字体大小"
            defaultOpen={false}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[14px] text-[#2C2C2C]">当前大小</span>
                <span className="text-[12px] text-[#9B9B8E]">{fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#9B9B8E]">小</span>
                <input
                  type="range"
                  min={12}
                  max={20}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-[#E2E0D8] rounded-full appearance-none cursor-pointer accent-[#5B7E71]"
                  style={{
                    background: `linear-gradient(to right, #5B7E71 0%, #5B7E71 ${((fontSize - 12) / (20 - 12)) * 100}%, #E2E0D8 ${((fontSize - 12) / (20 - 12)) * 100}%, #E2E0D8 100%)`,
                  }}
                />
                <span className="text-[14px] text-[#9B9B8E]">大</span>
              </div>
            </div>
          </CollapsibleSection>

          {/* Notifications */}
          <CollapsibleSection
            icon={<Bell size={16} strokeWidth={1.5} className="text-[#6B8FAD]" />}
            title="通知设置"
            defaultOpen={false}
          >
            <div className="space-y-3">
              <ToggleRow
                label="启用通知"
                desc="接收阅读提醒和更新"
                enabled={notifEnabled}
                onChange={setNotifEnabled}
              />
              {notifEnabled && (
                <>
                  <ToggleRow
                    label="每日提醒"
                    desc="每天提醒阅读"
                    enabled={notifDaily}
                    onChange={setNotifDaily}
                  />
                  <ToggleRow
                    label="每周总结"
                    desc="每周阅读报告"
                    enabled={notifWeekly}
                    onChange={setNotifWeekly}
                  />
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* Data Management */}
          <CollapsibleSection
            icon={<Download size={16} strokeWidth={1.5} className="text-[#7BAE7F]" />}
            title="数据管理"
            defaultOpen={false}
          >
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  try {
                    exportData();
                  } catch {
                    alert('导出失败，请重试');
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5B7E71]/10 text-[#5B7E71] text-[13px] font-medium hover:bg-[#5B7E71]/20 transition-colors"
              >
                <Upload size={14} strokeWidth={1.5} />
                导出数据
              </button>
              <button
                onClick={async () => {
                  try {
                    const count = await importData();
                    alert(`导入成功！共导入 ${count} 条数据`);
                    window.location.reload();
                  } catch (e) {
                    alert(`导入失败：${e instanceof Error ? e.message : '未知错误'}`);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6B8FAD]/10 text-[#6B8FAD] text-[13px] font-medium hover:bg-[#6B8FAD]/20 transition-colors"
              >
                <Download size={14} strokeWidth={1.5} />
                导入数据
              </button>
            </div>
          </CollapsibleSection>

          {/* About & Help */}
          <CollapsibleSection
            icon={<Info size={16} strokeWidth={1.5} className="text-[#A67C52]" />}
            title="关于与帮助"
            defaultOpen={false}
          >
            <div className="space-y-2">
              <button
                onClick={() => navigate('/about')}
                className="w-full flex items-center justify-between py-2 text-[14px] text-[#2C2C2C] hover:text-[#5B7E71] transition-colors"
              >
                <span>关于 Aria·R</span>
                <ChevronRight size={16} strokeWidth={1.5} className="text-[#9B9B8E]" />
              </button>
              <button
                onClick={() => navigate('/help')}
                className="w-full flex items-center justify-between py-2 text-[14px] text-[#2C2C2C] hover:text-[#5B7E71] transition-colors"
              >
                <span>帮助中心</span>
                <ChevronRight size={16} strokeWidth={1.5} className="text-[#9B9B8E]" />
              </button>
              <button
                onClick={() => navigate('/feedback')}
                className="w-full flex items-center justify-between py-2 text-[14px] text-[#2C2C2C] hover:text-[#5B7E71] transition-colors"
              >
                <span>意见反馈</span>
                <ChevronRight size={16} strokeWidth={1.5} className="text-[#9B9B8E]" />
              </button>
            </div>
          </CollapsibleSection>

          {/* Logout */}
          <div className="px-5 py-4">
            <button
              onClick={() => {
                if (window.confirm('确定要退出登录吗？')) {
                  localStorage.removeItem('aria-r:user');
                  setUser(null);
                  setIsLoggedIn(false);
                  navigate('/login');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-medium text-[#C47C7C] bg-[#C47C7C]/10 hover:bg-[#C47C7C]/20 transition-colors"
            >
              <LogOut size={16} strokeWidth={1.5} />
              退出登录
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
   Sub-components
   ────────────────────────────────────────────── */

function ToggleRow({
  label,
  desc,
  enabled,
  onChange,
}: {
  label: string;
  desc?: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[13px] text-[#2C2C2C]">{label}</div>
        {desc && <div className="text-[11px] text-[#9B9B8E]">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors duration-300 shrink-0',
          enabled ? 'bg-[#5B7E71]' : 'bg-[#E2E0D8]'
        )}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: enabled ? 22 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}
