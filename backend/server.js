import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 存储验证码（内存中，5分钟过期）
const codeStore = new Map();

// 清理过期验证码
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of codeStore.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) {
      codeStore.delete(email);
    }
  }
}, 60 * 1000);

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 生成6位验证码
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 发送验证码接口
app.post('/api/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: '邮箱格式不正确' });
    }

    // 检查是否在60秒内已发送
    const existing = codeStore.get(email);
    if (existing && Date.now() - existing.timestamp < 60 * 1000) {
      return res.status(429).json({ success: false, message: '请等待60秒后再试' });
    }

    const code = generateCode();

    // 发送邮件
    await transporter.sendMail({
      from: `"Aria·R" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '【Aria·R】验证码',
      html: `
        <div style="font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #5B7E71; margin: 0;">Aria·R</h2>
            <p style="color: #6B6B6B; font-size: 14px; margin-top: 8px;">阅读即共鸣</p>
          </div>
          <div style="background: #F8F6F0; border-radius: 12px; padding: 24px; text-align: center;">
            <p style="color: #2C2C2C; font-size: 14px; margin: 0 0 16px;">您的验证码为：</p>
            <div style="font-size: 32px; font-weight: bold; color: #5B7E71; letter-spacing: 8px; font-family: 'JetBrains Mono', monospace;">${code}</div>
            <p style="color: #9B9B8E; font-size: 12px; margin: 16px 0 0;">验证码5分钟内有效，请勿泄露给他人</p>
          </div>
          <p style="color: #9B9B8E; font-size: 12px; text-align: center; margin-top: 16px;">如非本人操作，请忽略此邮件</p>
        </div>
      `,
    });

    // 存储验证码
    codeStore.set(email, {
      code,
      timestamp: Date.now(),
    });

    console.log(`验证码已发送至 ${email}: ${code}`);

    res.json({ success: true, message: '验证码已发送' });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ success: false, message: '发送失败，请稍后重试' });
  }
});

// 验证验证码接口
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }

  const stored = codeStore.get(email);

  if (!stored) {
    return res.status(400).json({ success: false, message: '验证码已过期，请重新获取' });
  }

  if (Date.now() - stored.timestamp > 5 * 60 * 1000) {
    codeStore.delete(email);
    return res.status(400).json({ success: false, message: '验证码已过期，请重新获取' });
  }

  if (stored.code !== code) {
    return res.status(400).json({ success: false, message: '验证码错误' });
  }

  // 验证成功，删除验证码
  codeStore.delete(email);

  res.json({ success: true, message: '验证成功' });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aria·R 后端服务运行中' });
});

app.listen(PORT, () => {
  console.log(`Aria·R 后端服务已启动: http://localhost:${PORT}`);
  console.log(`邮件发送服务已配置: ${process.env.SMTP_HOST}`);
});
