# Aria·R

一个私人的阅读伴侣，帮助管理藏书、记录摘录、追踪进度，发现书籍之间的共鸣。

> 阅读即共鸣，每一次翻页都是一次灵魂的相遇。

## 技术栈

- 前端：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- 路由：React Router v7
- 动画：Framer Motion
- 图谱：D3.js
- 后端：Node.js + Express + Nodemailer
- 数据：localStorage（前端）+ 邮件服务（后端）

## 功能

- 邮箱注册/登录（验证码 + 算术题验证）
- 书籍管理（添加、编辑、删除、ISBN 自动查询、封面上传）
- 摘录集（添加、语音输入、智能标签）
- 随笔（Markdown、置顶、富文本）
- 回响（时间筛选、随机回顾）
- 共鸣图谱（D3.js 力导向图）
- 曲目清单（阅读队列、目标管理）
- 阅读时间线（甘特图）
- 个人中心（头像、昵称、数据导入导出）
- 暗色模式、响应式设计

## 项目结构

```
Aria·R/
├── app/              # 前端
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/          # 后端
│   ├── server.js
│   └── package.json
├── info.md
├── plan.md
└── plan-v2.md
```

## 本地开发

### 前端

```bash
cd app
npm install
npm run dev
```

### 后端

```bash
cd backend
npm install
node server.js
```

## 部署

详见 DEPLOY.md

## 许可证

MIT