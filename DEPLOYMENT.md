# 蔡小作业平台 - 部署指南

## 项目概述

蔡小作业平台是一个智能作业管理与自动批改系统，支持：
- 用户系统（注册、登录、个人信息管理）
- 作业管理（老师发布、学生提交）
- 自动判题（图片识别 + AI批改）
- 统计分析（作业完成情况、成绩统计）

## 技术栈

- **前端框架**: Next.js 16 + React 19 + TypeScript
- **UI组件**: shadcn/ui + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **文件存储**: 对象存储 (S3兼容)
- **AI能力**: LLM (自动批改) + Vision (图片识别)

---

## 部署步骤

### 第一步：准备工作

#### 1. 注册必要账号
- [GitHub 账号](https://github.com)
- [Netlify 账号](https://www.netlify.com)
- [Supabase 账号](https://supabase.com)

#### 2. 获取 Supabase 凭证

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 创建新项目或使用现有项目
3. 进入 `Settings` → `API` 获取以下信息：
   - `Project URL` → 对应 `COZE_SUPABASE_URL`
   - `anon public` key → 对应 `COZE_SUPABASE_ANON_KEY`

---

### 第二步：部署到 GitHub

#### 方法1：使用 Git 命令行

```bash
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "feat: 初始化蔡小作业平台"

# 4. 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 5. 推送到 GitHub
git push -u origin main
```

#### 方法2：使用 GitHub Desktop

1. 打开 GitHub Desktop
2. 选择 `File` → `Add Local Repository`
3. 选择项目文件夹
4. 点击 `Publish repository` 发布到 GitHub

---

### 第三步：部署到 Netlify

#### 方法1：通过 Netlify 网站部署

1. 登录 [Netlify](https://app.netlify.com)
2. 点击 `Add new site` → `Import an existing project`
3. 选择 `GitHub` 作为代码源
4. 授权 Netlify 访问你的 GitHub 仓库
5. 选择蔡小作业平台的仓库
6. 配置构建设置：
   - **Build command**: `pnpm run build`
   - **Publish directory**: `.next`
7. 点击 `Deploy site` 开始部署

#### 方法2：通过 Netlify CLI 部署

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录 Netlify
netlify login

# 3. 初始化项目
netlify init

# 4. 部署
netlify deploy --prod
```

---

### 第四步：配置环境变量

在 Netlify 中配置必要的环境变量：

1. 进入 Netlify 项目仪表板
2. 点击 `Site settings` → `Environment variables`
3. 添加以下环境变量：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `COZE_SUPABASE_URL` | Supabase 项目 URL | Supabase Dashboard → Settings → API |
| `COZE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | Supabase Dashboard → Settings → API |
| `COZE_BUCKET_ENDPOINT_URL` | 对象存储端点 | 对象存储服务商提供 |
| `COZE_BUCKET_NAME` | 存储桶名称 | 对象存储服务商提供 |

4. 保存后，点击 `Deploys` → `Trigger deploy` → `Deploy site` 重新部署

---

## 使用指南

### 教师使用流程

1. **注册账号**
   - 访问部署后的网站
   - 点击"立即注册"
   - 选择角色为"老师"

2. **发布作业**
   - 登录后进入教师工作台
   - 点击"发布作业"
   - 填写作业标题、内容、截止时间
   - 提交发布

3. **查看学生提交**
   - 点击"学生提交"查看提交情况
   - 查看自动批改结果
   - 查看统计分析数据

### 学生使用流程

1. **注册账号**
   - 访问部署后的网站
   - 点击"立即注册"
   - 选择角色为"学生"
   - 填写班级信息

2. **提交作业**
   - 登录后进入学生作业中心
   - 点击"查看作业"
   - 选择要提交的作业
   - 输入文字内容或上传图片
   - 提交作业

3. **查看成绩**
   - 点击"我的提交"查看提交记录
   - 查看批改结果和反馈
   - 查看成绩统计

---

## 微信分享

部署完成后，你可以通过微信分享给学生：

1. **复制链接**
   - 在 Netlify 项目页面找到部署的网站 URL
   - 例如：`https://你的项目名.netlify.app`

2. **微信分享方式**
   - 直接发送链接给学生
   - 生成二维码（使用在线二维码生成器）
   - 分享到微信群或朋友圈

3. **快捷访问**
   - 学生点击链接即可访问
   - 建议收藏网址以便快速访问

---

## 常见问题

### Q1: 部署后页面无法访问？
**A**: 检查环境变量是否正确配置，特别是 Supabase 的 URL 和密钥

### Q2: 上传图片失败？
**A**: 检查对象存储配置是否正确，确保 `COZE_BUCKET_ENDPOINT_URL` 和 `COZE_BUCKET_NAME` 已设置

### Q3: AI批改失败？
**A**: 确保环境变量配置正确，LLM API 已启用

### Q4: 数据库连接失败？
**A**: 检查 Supabase 项目是否正常运行，URL 和密钥是否正确

---

## 技术支持

如遇到问题，请检查：
1. Netlify 部署日志
2. 浏览器控制台错误信息
3. 环境变量配置

---

## 许可证

本项目仅供学习和教育用途。

---

## 更新日志

### v1.0.0 (2026-03-09)
- 初始版本发布
- 实现用户系统
- 实现作业管理
- 实现自动判题
- 实现统计分析
