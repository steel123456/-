# 蔡小作业平台

一个智能作业管理与自动批改系统，支持老师发布作业、学生在线提交、AI自动批改和成绩统计分析。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

## ✨ 核心功能

### 👨‍🏫 教师功能
- 发布作业（设置题目、截止时间）
- 查看学生提交情况
- 查看自动批改结果
- 统计分析作业完成情况
- 下载和展示优秀作业

### 👨‍🎓 学生功能
- 在线查看作业
- 提交作业（文字或图片）
- 查看批改结果和反馈
- 查看个人成绩统计

### 🤖 AI智能功能
- 图片内容识别（自动提取图片中的文字）
- 自动批改作业（AI评分和反馈）
- 智能统计分析

### 📊 数据统计
- 作业完成情况统计
- 合格率分析
- 成绩分布图表
- 优秀作业展示

## 🚀 快速开始

### 环境要求
- Node.js 18+
- pnpm

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
COZE_SUPABASE_URL=your_supabase_url
COZE_SUPABASE_ANON_KEY=your_supabase_anon_key
COZE_BUCKET_ENDPOINT_URL=your_bucket_endpoint
COZE_BUCKET_NAME=your_bucket_name
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5000

## 📦 技术栈

### 前端
- **Next.js 16** - React 框架
- **React 19** - 用户界面库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - UI 组件库
- **Recharts** - 图表库

### 后端
- **Next.js API Routes** - 服务端 API
- **Supabase** - 数据库和认证
- **对象存储** - 文件存储

### AI 能力
- **LLM** - 自动批改和评分
- **Vision** - 图片内容识别

## 📁 项目结构

```
├── src/
│   ├── app/                  # Next.js 应用目录
│   │   ├── api/              # API 路由
│   │   ├── assignments/      # 作业相关页面
│   │   ├── dashboard/        # 仪表板页面
│   │   ├── login/            # 登录页面
│   │   ├── profile/          # 个人信息页面
│   │   ├── register/         # 注册页面
│   │   ├── statistics/       # 统计分析页面
│   │   └── submissions/      # 提交记录页面
│   ├── components/           # React 组件
│   │   └── ui/               # UI 组件
│   ├── contexts/             # React Context
│   └── storage/              # 数据存储
│       └── database/         # 数据库配置
├── public/                   # 静态资源
├── DEPLOYMENT.md             # 部署指南
└── README.md                 # 项目说明
```

## 🗄️ 数据库设计

### 用户表 (profiles)
- id, email, name, role, class_name, avatar
- created_at, updated_at

### 作业表 (assignments)
- id, title, description, deadline
- teacher_id, teacher_name, status
- total_submissions, passed_count, failed_count, average_score
- created_at, updated_at

### 提交记录表 (submissions)
- id, assignment_id, student_id, student_name
- content_type, content, file_key
- auto_score, feedback, status, is_passed
- submitted_at, graded_at

## 🚀 部署

详细的部署指南请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

### 快速部署到 Netlify

1. 将代码推送到 GitHub
2. 在 Netlify 中导入项目
3. 配置环境变量
4. 点击部署

部署完成后即可通过微信分享链接给学生使用。

## 📱 微信分享

部署后，将网站链接通过微信发送给学生：
- 直接发送链接
- 生成二维码分享
- 分享到微信群

学生点击链接即可访问，无需下载安装。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目仅供学习和教育用途。

---

**蔡小作业平台** - 让作业管理更智能 ✨
