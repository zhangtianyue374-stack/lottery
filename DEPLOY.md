# 部署指南

本指南将帮助您将抽奖系统部署上线，全程免费。

---

## 一、准备工作

### 1.1 注册必要账号

1. **GitHub** - https://github.com
   - 创建免费账号
   - 创建新仓库 `lottery-system`

2. **MongoDB Atlas** - https://www.mongodb.com/atlas
   - 注册免费账号
   - 创建免费 M0 集群（Shared）
   - 创建数据库用户并获取连接字符串
   - 格式：`mongodb+srv://<username>:<password>@<cluster>.mongodb.net/lottery`

3. **Railway** - https://railway.app
   - 使用 GitHub 登录
   - 创建新项目

4. **Vercel** - https://vercel.com
   - 使用 GitHub 登录

---

## 二、推送代码到 GitHub

### 2.1 初始化 Git 仓库

```bash
cd "G:\学习\ai\简化版抽奖"

# 初始化 Git
git init

# 添加所有文件（排除 node_modules）
git add .

# 提交
git commit -m "Initial commit: 抽奖系统"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/lottery-system.git

# 推送
git branch -M main
git push -u origin main
```

---

## 三、部署后端（Railway）

### 3.1 创建 Railway 项目

1. 登录 Railway
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择 `lottery-system` 仓库
4. Railway 会自动检测 Node.js 项目

### 3.2 配置环境变量

在 Railway 项目设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `3000` | 端口 |
| `NODE_ENV` | `production` | 生产环境 |
| `MONGODB_URI` | 你的 Atlas 连接字符串 | **必填** |
| `JWT_SECRET` | `your-super-secret-key-change-me` | JWT密钥，至少32位 |
| `JWT_EXPIRES_IN` | `7d` | Token过期时间 |
| `ADMIN_USERNAME` | `admin` | 管理员用户名 |
| `ADMIN_PASSWORD` | `your-admin-password` | 管理员密码 |

### 3.3 配置构建命令

Railway 会自动检测，但需要确认：
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3.4 获取后端 URL

部署成功后，Railway 会提供一个 URL，格式如：
`https://lottery-server.up.railway.app`

**记录这个 URL，后面会用到。**

---

## 四、部署前端（Vercel）

### 4.1 创建 Vercel 项目

1. 登录 Vercel
2. 点击 **Add New** → **Project**
3. 导入 `lottery-system` 仓库
4. Vercel 会自动检测 Vue 3 项目

### 4.2 配置构建

- **Framework Preset**: Vite（通常自动检测）
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 4.3 添加环境变量

在 Vercel 项目设置中添加：

| 变量名 | 值 |
|--------|-----|
| `VITE_API_BASE_URL` | `https://your-railway-app.railway.app/api` |

> ⚠️ 将 `your-railway-app` 替换为你在 Railway 获得的后端 URL

### 4.4 部署

点击 **Deploy**，等待构建完成。

Vercel 会提供你的前端 URL，格式如：
`https://lottery-system.vercel.app`

---

## 五、验证部署

### 5.1 检查后端

访问：`https://your-railway-app.railway.app/api/health`

应该返回：
```json
{"status":"ok","timestamp":"..."}
```

### 5.2 检查前端

访问你的 Vercel URL，应该能看到抽奖系统首页。

---

## 六、初始化管理后台

### 6.1 登录管理后台

1. 访问 `{你的Vercel域名}/admin`
2. 使用你在环境变量中设置的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 登录

### 6.2 上传订单表

1. 进入「订单管理」
2. 上传微店导出的 Excel 文件（.xlsx）
3. 系统会自动解析订单号和结算金额

### 6.3 生成大奖候选池

1. 进入「抽奖管理」
2. 点击「生成候选池」
3. 系统会根据用户订单总额排序，生成前10名候选池

### 6.4 抽取大奖

1. 点击「开始抽取」
2. 系统会从候选池中随机抽取5名中奖者

### 6.5 导出中奖名单

1. 点击「导出中奖名单」
2. 下载 Excel 文件

---

## 七、常见问题

### Q1: 部署后无法注册/登录？

检查：
1. 后端是否正常启动（Railway 日志）
2. MongoDB Atlas 是否允许当前 IP 访问
3. CORS 配置是否正确

### Q2: MongoDB Atlas 连接失败？

1. 在 Atlas Network Access 中添加 `0.0.0.0/0`（允许所有 IP）
2. 或添加 Railway 的 IP 地址

### Q3: 前端 API 请求失败？

1. 检查 Vercel 环境变量 `VITE_API_BASE_URL` 是否正确
2. 确保后端 CORS 配置包含你的 Vercel 域名

---

## 八、更新代码

更新代码后，只需推送到 GitHub，Railway 和 Vercel 会自动重新部署。

```bash
git add .
git commit -m "Your update message"
git push
```

---

*祝部署顺利！*
