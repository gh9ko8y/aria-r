import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@/types';
import { initializeData, saveUser } from '@/lib/storage';

/* ─── Types ─────────────────────────────────────── */

type AuthView = 'login' | 'codeLogin' | 'register';

interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  nickname: string;
  code: string;
  captchaAnswer: string;
  rememberMe: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  code?: string;
  captcha?: string;
  general?: string;
}

interface CaptchaChallenge {
  a: number;
  b: number;
  answer: number;
}

/* ─── Constants ─────────────────────────────────── */

const USERS_KEY = 'aria-r:users';
const API_BASE = '/api';

const DEMO_EMAIL = 'reader@aria-r.app';
const DEMO_PASSWORD = '123456';

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/* ─── localStorage helpers ──────────────────────── */

function getRegisteredUsers(): (User & { password?: string })[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveRegisteredUser(user: User & { password: string }): void {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email: string): (User & { password?: string }) | undefined {
  return getRegisteredUsers().find(u => u.email === email);
}

/* ─── Validation helpers ────────────────────────── */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateCaptcha(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

/* ─── Page transition variants ──────────────────── */

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

/* ─── Main Component ────────────────────────────── */

export default function Login() {
  const navigate = useNavigate();

  const [view, setView] = useState<AuthView>('login');
  const [formData, setFormData] = useState<AuthFormData>({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    confirmPassword: '',
    nickname: '',
    code: '',
    captchaAnswer: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaChallenge>(generateCaptcha);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ─── Cleanup countdown ───────────────────────── */
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  /* ─── Form field updater ──────────────────────── */
  const updateField = useCallback(<K extends keyof AuthFormData>(
    field: K,
    value: AuthFormData[K],
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    setSuccessMessage('');
  }, []);

  /* ─── Countdown timer ─────────────────────────── */
  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /* ─── Switch view ─────────────────────────────── */
  const switchView = useCallback((newView: AuthView) => {
    setView(newView);
    setErrors({});
    setSuccessMessage('');
    setFormData(prev => ({ ...prev, password: '', code: '', captchaAnswer: '' }));
    if (newView === 'register') {
      setCaptcha(generateCaptcha());
    }
  }, []);

  /* ─── Validate login form ─────────────────────── */
  const validateLogin = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空哦';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '邮箱格式不太对哦，再检查一下？';
    }

    if (!formData.password) {
      newErrors.password = '密码不能为空，它在等你输入呢';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.password]);

  /* ─── Validate code login form ────────────────── */
  const validateCodeLogin = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空哦';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '邮箱格式不太对哦，再检查一下？';
    }

    if (!formData.code.trim()) {
      newErrors.code = '请输入验证码';
    } else if (formData.code.trim().length !== 6 || !/^\d{6}$/.test(formData.code.trim())) {
      newErrors.code = '验证码应为6位数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.code]);

  /* ─── Validate register form ──────────────────── */
  const validateRegister = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空哦';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = '邮箱格式不太对哦，再检查一下？';
    }

    if (!formData.password) {
      newErrors.password = '密码不能为空，它在等你输入呢';
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少6位，再长一点更安全';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码不一致，再检查一下？';
    }

    if (!formData.captchaAnswer.trim()) {
      newErrors.captcha = '请回答验证问题';
    } else if (parseInt(formData.captchaAnswer, 10) !== captcha.answer) {
      newErrors.captcha = '答案不对哦，再算一次？';
    }

    if (!formData.code.trim()) {
      newErrors.code = '请输入验证码';
    } else if (formData.code.trim().length !== 6 || !/^\d{6}$/.test(formData.code.trim())) {
      newErrors.code = '验证码应为6位数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, captcha]);

  /* ─── Handle login submit ─────────────────────── */
  const handleLogin = useCallback(async () => {
    if (!validateLogin()) return;
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const user = findUserByEmail(formData.email);
    if (!user) {
      setErrors({ general: '这个邮箱还没注册过，要不要写第一笔？' });
      setIsSubmitting(false);
      return;
    }

    if (user.password !== formData.password) {
      setErrors({ password: '密码不匹配，是不是记混了？' });
      setIsSubmitting(false);
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    saveUser(userWithoutPassword as User);
    initializeData();
    navigate('/');
  }, [validateLogin, formData, navigate]);

  /* ─── Handle code login submit ────────────────── */
  const handleCodeLogin = useCallback(async () => {
    if (!validateCodeLogin()) return;
    setIsSubmitting(true);

    try {
      // 验证验证码
      const verifyRes = await fetch(`${API_BASE}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.code }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setErrors({ code: verifyData.message || '验证码验证失败' });
        setIsSubmitting(false);
        return;
      }
    } catch {
      setErrors({ general: '网络错误，请检查后端服务是否启动' });
      setIsSubmitting(false);
      return;
    }

    const user = findUserByEmail(formData.email);
    if (!user) {
      setErrors({ general: '这个邮箱还没注册过，要不要写第一笔？' });
      setIsSubmitting(false);
      return;
    }

    const { password: _, ...userWithoutPassword } = user;
    saveUser(userWithoutPassword as User);
    initializeData();
    navigate('/');
  }, [validateCodeLogin, formData, navigate]);

  /* ─── Handle register submit ──────────────────── */
  const handleRegister = useCallback(async () => {
    if (!validateRegister()) return;
    setIsSubmitting(true);

    try {
      // 验证验证码
      const verifyRes = await fetch(`${API_BASE}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.code }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setErrors({ code: verifyData.message || '验证码验证失败' });
        setIsSubmitting(false);
        return;
      }
    } catch {
      setErrors({ general: '网络错误，请检查后端服务是否启动' });
      setIsSubmitting(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (findUserByEmail(formData.email)) {
      setErrors({ email: '这个邮箱已经注册过了，去登录吧' });
      setIsSubmitting(false);
      return;
    }

    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      email: formData.email,
      nickname: formData.nickname || formData.email.split('@')[0],
      avatar: '',
      gender: 'other',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      password: formData.password,
    };

    saveRegisteredUser(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    saveUser(userWithoutPassword as User);
    initializeData();

    setSuccessMessage('太好了！你的专属空间已开启');
    setIsSubmitting(false);

    setTimeout(() => {
      navigate('/');
    }, 1200);
  }, [validateRegister, formData, navigate]);

  /* ─── Handle send code ────────────────────────── */
  const handleSendCode = useCallback(async () => {
    if (isSendingCode || countdown > 0) return;
    
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      setErrors(prev => ({ ...prev, email: formData.email.trim() ? '邮箱格式不太对哦，再检查一下？' : '邮箱不能为空哦' }));
      return;
    }

    setIsSendingCode(true);

    try {
      const res = await fetch(`${API_BASE}/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors(prev => ({ ...prev, general: data.message || '发送失败，请稍后重试' }));
        setIsSendingCode(false);
        return;
      }

      startCountdown();
      setSuccessMessage('验证码已发送，请查看邮箱');
    } catch {
      setErrors(prev => ({ ...prev, general: '网络错误，请检查后端服务是否启动' }));
    } finally {
      setIsSendingCode(false);
    }
  }, [formData.email, startCountdown, isSendingCode, countdown]);

  /* ─── Render helpers ──────────────────────────── */

  const inputClasses =
    'h-11 rounded-lg border-[#E2E0D8] bg-white/60 px-4 text-[15px] text-[#2C2C2C] placeholder:text-[#9B9B8E] transition-all focus-visible:border-[#5B7E71] focus-visible:ring-[#5B7E71]/20 focus-visible:ring-[3px]';

  return (
    <div
      className="relative flex min-h-[100dvh] w-full items-center justify-center px-4 py-8"
      style={{ backgroundColor: '#F8F6F0' }}
    >
      {/* Subtle paper texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(44,44,44,0.03) 2px, rgba(44,44,44,0.03) 4px)',
        }}
      />

      {/* Main card */}
      <motion.div
        className="relative w-full max-w-[400px] overflow-hidden rounded-2xl border border-[#E2E0D8] bg-white/80 p-8 shadow-[0_8px_32px_rgba(44,44,44,0.08)] backdrop-blur-sm"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: EASE_OUT }}
      >
        {/* Logo */}
        <motion.div
          className="mb-2 flex flex-col items-center"
          variants={staggerItem}
          initial="hidden"
          animate="visible"
        >
          <div className="mb-3 flex items-center gap-2">
            <img
              src="/icon.png"
              alt="Aria·R"
              className="h-10 w-10 rounded-xl"
            />
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{
                color: '#2C2C2C',
                fontFamily: '"LXGW WenKai", "PingFang SC", "Microsoft YaHei", sans-serif',
              }}
            >
              Aria·R
            </span>
          </div>
          <p
            className="text-center text-sm leading-relaxed"
            style={{
              color: '#6B6B6B',
              fontFamily: '"Source Han Serif CN", "Songti SC", serif',
            }}
          >
            每一次阅读，都是一场灵魂的共鸣。
          </p>
        </motion.div>

        {/* Success message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-4 rounded-lg px-4 py-3 text-center text-sm font-medium"
              style={{ backgroundColor: 'rgba(123,174,127,0.12)', color: '#5B7E71' }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="mb-4 rounded-lg px-4 py-3 text-center text-sm"
              style={{ backgroundColor: 'rgba(196,124,124,0.1)', color: '#C47C7C' }}
            >
              {errors.general}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form views */}
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.div
              key="login"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: '#2C2C2C' }}
                  >
                    邮箱
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className={inputClasses}
                  />
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs"
                      style={{ color: '#C47C7C' }}
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label
                    className="text-sm font-medium"
                    style={{ color: '#2C2C2C' }}
                  >
                    密码
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="输入密码"
                      value={formData.password}
                      onChange={e => updateField('password', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                      className={`${inputClasses} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B8E] transition-colors hover:text-[#6B6B6B]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs"
                      style={{ color: '#C47C7C' }}
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Remember me */}
                <motion.div variants={staggerItem} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={checked => updateField('rememberMe', checked === true)}
                      className="size-4 rounded border-[#E2E0D8] data-[state=checked]:border-[#5B7E71] data-[state=checked]:bg-[#5B7E71]"
                    />
                    <label
                      htmlFor="remember"
                      className="cursor-pointer text-sm"
                      style={{ color: '#6B6B6B' }}
                    >
                      记住我
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => switchView('codeLogin')}
                    className="text-sm transition-colors hover:underline"
                    style={{ color: '#6B8FAD' }}
                  >
                    验证码登录
                  </button>
                </motion.div>

                {/* Submit button */}
                <motion.div variants={staggerItem}>
                  <Button
                    onClick={handleLogin}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg text-base font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.97] disabled:opacity-70"
                    style={{ backgroundColor: '#5B7E71' }}
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    落笔
                  </Button>
                </motion.div>

                {/* Toggle to register */}
                <motion.p
                  variants={staggerItem}
                  className="text-center text-sm"
                  style={{ color: '#6B6B6B' }}
                >
                  还没有账号？
                  <button
                    type="button"
                    onClick={() => switchView('register')}
                    className="ml-1 font-medium transition-colors hover:underline"
                    style={{ color: '#6B8FAD' }}
                  >
                    去注册
                  </button>
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {view === 'codeLogin' && (
            <motion.div
              key="codeLogin"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    邮箱
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    className={inputClasses}
                  />
                  {errors.email && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Send code button */}
                <motion.div variants={staggerItem}>
                  <Button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || isSendingCode}
                    variant="outline"
                    className="h-10 w-full rounded-lg border-[#E2E0D8] text-sm font-medium transition-all hover:bg-[#5B7E71]/5 disabled:opacity-50"
                    style={{ color: countdown > 0 || isSendingCode ? '#9B9B8E' : '#5B7E71' }}
                  >
                    {isSendingCode ? '发送中...' : countdown > 0 ? `${countdown} 秒后重发` : '发送验证码'}
                  </Button>
                </motion.div>

                {/* Verification code */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    验证码
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6位数字"
                    value={formData.code}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      updateField('code', val);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleCodeLogin()}
                    className={inputClasses}
                  />
                  {errors.code && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.code}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit */}
                <motion.div variants={staggerItem}>
                  <Button
                    onClick={handleCodeLogin}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg text-base font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.97] disabled:opacity-70"
                    style={{ backgroundColor: '#5B7E71' }}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    落笔
                  </Button>
                </motion.div>

                {/* Back to password login */}
                <motion.p variants={staggerItem} className="text-center text-sm" style={{ color: '#6B6B6B' }}>
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="font-medium transition-colors hover:underline"
                    style={{ color: '#6B8FAD' }}
                  >
                    密码登录
                  </button>
                </motion.p>
              </motion.div>
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div
              key="register"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-4"
              >
                {/* Email */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    邮箱
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => updateField('email', e.target.value)}
                    className={inputClasses}
                  />
                  {errors.email && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.email}
                    </motion.p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    密码
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="至少6位"
                      value={formData.password}
                      onChange={e => updateField('password', e.target.value)}
                      className={`${inputClasses} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B8E] transition-colors hover:text-[#6B6B6B]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.password}
                    </motion.p>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    确认密码
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="再次输入密码"
                      value={formData.confirmPassword}
                      onChange={e => updateField('confirmPassword', e.target.value)}
                      className={`${inputClasses} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B8E] transition-colors hover:text-[#6B6B6B]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>

                {/* Arithmetic CAPTCHA */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    人机验证
                  </label>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 shrink-0 items-center justify-center rounded-lg border border-[#E2E0D8] bg-[#F5F4EE] px-4 text-base font-medium select-none"
                      style={{ color: '#2C2C2C', fontFamily: '"JetBrains Mono", "Courier New", monospace', minWidth: '100px' }}
                    >
                      {captcha.a} + {captcha.b} = ?
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="答案"
                      value={formData.captchaAnswer}
                      onChange={e => updateField('captchaAnswer', e.target.value.replace(/\D/g, ''))}
                      className={`${inputClasses} h-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setCaptcha(generateCaptcha())}
                      className="shrink-0 rounded-lg p-2 text-[#9B9B8E] transition-colors hover:bg-[#F5F4EE] hover:text-[#6B6B6B]"
                      title="换一题"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
                    </button>
                  </div>
                  {errors.captcha && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.captcha}
                    </motion.p>
                  )}
                </motion.div>

                {/* Verification Code */}
                <motion.div variants={staggerItem} className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: '#2C2C2C' }}>
                    验证码
                  </label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6位数字"
                      value={formData.code}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        updateField('code', val);
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleRegister()}
                      className={`${inputClasses} flex-1`}
                    />
                    <Button
                      type="button"
                      onClick={handleSendCode}
                      disabled={countdown > 0 || isSendingCode}
                      variant="outline"
                      className="h-11 shrink-0 rounded-lg border-[#E2E0D8] px-4 text-sm font-medium transition-all hover:bg-[#5B7E71]/5 disabled:opacity-50"
                      style={{ color: countdown > 0 || isSendingCode ? '#9B9B8E' : '#5B7E71' }}
                    >
                      {isSendingCode ? '...' : countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                  {errors.code && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs" style={{ color: '#C47C7C' }}>
                      {errors.code}
                    </motion.p>
                  )}
                </motion.div>

                {/* Submit */}
                <motion.div variants={staggerItem}>
                  <Button
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-lg text-base font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.97] disabled:opacity-70"
                    style={{ backgroundColor: '#5B7E71' }}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    落笔
                  </Button>
                </motion.div>

                {/* Toggle to login */}
                <motion.p variants={staggerItem} className="text-center text-sm" style={{ color: '#6B6B6B' }}>
                  已有账号？
                  <button
                    type="button"
                    onClick={() => switchView('login')}
                    className="ml-1 font-medium transition-colors hover:underline"
                    style={{ color: '#6B8FAD' }}
                  >
                    去登录
                  </button>
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
