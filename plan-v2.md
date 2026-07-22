# Aria·R v2 增量开发计划

## 变更对比

### 新增页面（7个）
| 页面 | 路由 | 说明 |
|------|------|------|
| 登录/注册 | `/login` | 邮箱+密码/验证码登录，注册带算术验证码 |
| 随笔 | `/essays` | 瀑布流卡片、富文本编辑、图文混排、置顶 |
| 阅读时间线 | `/timeline` | 甘特图形式，日/周/月/年视图 |
| 我的 | `/profile` | 个人中心、数据概览、设置入口 |
| 关于 | `/about` | 项目介绍、版本信息、致谢 |
| 帮助 | `/help` | 功能说明、FAQ |
| 反馈 | `/feedback` | 用户反馈表单 |

### 新增数据模型
- Essay（随笔）: id, userId, title, content, coverImage, tags, relatedBookId, relatedExcerptId, mood, location, weather, isPinned, createdAt, updatedAt
- User: id, email, nickname, avatar, gender, bio
- ReadingLog: id, bookId, userId, date, startTime, endTime, startPage, endPage, note

### 更新项
- 导航栏新增：随笔、阅读时间线、我的
- 路由更新
- 全局文案库（问候语、空状态、Toast提示）

## 执行计划

### Stage 1: 更新类型定义与数据层
- 新增 Essay, User, ReadingLog 类型
- 新增 localStorage 操作函数
- 新增 mock 数据

### Stage 2: 并行页面开发（4组）
- **组1**: 登录/注册页面
- **组2**: 随笔页面（瀑布流 + 富文本编辑器）
- **组3**: 阅读时间线（甘特图）+ 我的页面
- **组4**: 关于 + 帮助 + 反馈页面

### Stage 3: 更新共享组件
- Navbar: 新增导航项
- App.tsx: 新增路由

### Stage 4: 合并、构建、部署
