# 抽奖系统完整方案

> 文档版本：v1.1
> 生成日期：2026-03-28
> 技术栈：Vue 3 + Node.js + MongoDB
> 最后更新：2026-03-28（根据示例表.xlsx格式更新）

---

## 一、系统架构

### 1.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | Vue 3 + Vite + Pinia + TailwindCSS | 响应式，现代UI，快速开发 |
| 后端 | Node.js + Express | 安全中间件丰富，生态成熟 |
| 数据库 | MongoDB Atlas | 免费集群，无需暴露本机 |
| 部署 | Railway (后端) + Vercel (前端) | 免费额度足够 |
| 认证 | JWT + HTTP-only Cookie | 防XSS，防Token泄露 |

### 1.2 部署架构

```
用户浏览器
    ↓ HTTPS
[Vercel]  Vue3 前端 (静态托管)
    ↓ API 请求
[Railway] Node.js 后端
    ↓ 数据读写
[MongoDB Atlas] 数据库集群
```

---

## 二、数据库设计

### 2.0 微店订单表 Excel 格式（示例表.xlsx）

| Excel列名 | 列索引 | 说明 |
|-----------|--------|------|
| 订单编号 | 0 | 唯一订单号，主键 |
| 订单状态 | 1 | 如"已完成" |
| 下单时间 | 2 | 时间戳 |
| 结算金额 | 61 | **用于抽奖金额统计** |
| 买家昵称 | 44 | 买家联系方式参考 |
| 买家手机 | 45 | 买家手机号 |

> 注意：一个订单编号可能对应多行（多商品），解析时需按"订单编号"聚合，**结算金额取该订单编号下所有行之和**。
> 示例表共 126 行，125 个唯一订单号。

### 2.1 users（用户表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectId | 主键 |
| phone | String | 手机号（唯一） |
| wechatId | String | 微信号 |
| weiboId | String | 微博号 |
| password | String | bcrypt加密密码 |
| totalAmount | Number | 绑定订单总金额 |
| isGrandPrizeWinner | Boolean | 是否已中大奖 |
| createdAt | Date | 注册时间 |

### 2.2 orders（订单表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectId | 主键 |
| orderNo | String | 订单号（唯一索引） |
| totalAmount | Number | 订单金额 |
| status | String | pending/bound |
| bindedUserId | ObjectId | 绑定用户ID |
| bindedAt | Date | 绑定时间 |

### 2.3 lottery_records（抽奖记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectId | 主键 |
| userId | ObjectId | 用户ID |
| drawTime | Date | 抽奖时间 |
| wonPrize | String | none/consolation/grand |
| prizeLevel | String | 1/2/3/consolation/null |
| ipAddress | String | 抽奖IP |

### 2.4 prize_config（奖项配置表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectId | 主键 |
| grandPrizePool | Array | 大奖候选池用户ID（按订单总额排名前10） |
| grandPrizeDrawn | Boolean | 大奖是否已抽取 |
| firstPrize | ObjectId | 一等奖用户ID |
| secondPrize | Array[ObjectId] | 二等奖用户ID（2名） |
| thirdPrize | Array[ObjectId] | 三等奖用户ID（2名） |
| poolGeneratedAt | Date | 大奖候选池生成时间 |

### 2.5 admin（管理员表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | ObjectId | 主键 |
| username | String | 管理员用户名 |
| password | String | 加密密码 |

---

## 三、抽奖机制（核心逻辑）

### 3.1 订单绑定规则

1. 用户输入订单号，每行一个，支持批量绑定
2. 系统校验：
   - 订单号是否存在 → 不存在则报错
   - 是否已被其他用户绑定 → 已绑定则报错
   - 绑定成功后累加订单金额到用户totalAmount
3. 绑定后不可解绑

### 3.2 抽奖次数计算

| 订单总额区间 | 抽奖次数 |
|-------------|---------|
| 0 ~ 500元 | 1次 |
| 500 ~ 2000元 | 3次 |
| 2000 ~ 5000元 | 5次 |
| 5000元以上 | 8次 |

### 3.3 大奖抽取规则（隐藏条件）

**核心规则：订单总额排名前10的用户，进入大奖候选池**

流程：
1. 管理员上传微店订单表（Excel格式）
2. 用户绑定订单号，统计各用户totalAmount
3. 抽奖前，管理员执行"生成大奖候选池"，系统按totalAmount排序，取前10名用户写入prize_config.grandPrizePool
4. 大奖抽取：从这10人中随机抽取5人作为中奖者
5. 抽奖时判断：
   - 用户已在prize_config.grandPrizePool中
   - 用户未中过大奖（isGrandPrizeWinner=false）
   - 满足条件方可参与大奖抽取

### 3.4 奖项设置（仅大奖）

| 奖项 | 数量 | 抽取方式 |
|------|------|---------|
| 一等奖 | 1名 | 大奖池随机抽取 |
| 二等奖 | 2名 | 大奖池随机抽取 |
| 三等奖 | 2名 | 大奖池随机抽取 |

> **无安慰奖**，用户绑定订单后即可参与大奖池抽取。

---

## 四、API 接口设计

### 4.1 用户接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/logout | 退出登录 | 是 |
| GET | /api/auth/me | 获取当前用户 | 是 |

### 4.2 订单接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/orders/bind | 绑定订单号 | 是 |
| GET | /api/orders/my | 获取我的订单 | 是 |

### 4.3 抽奖接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/lottery/chances | 获取剩余抽奖次数 | 是 |
| GET | /api/lottery/pool | 获取大奖池状态（是否在池中、是否已中大奖） | 是 |
| POST | /api/lottery/draw-grand | 大奖抽取（点击即抽，一次性） | 是 |
| GET | /api/lottery/records | 抽奖记录 | 是 |

### 4.4 管理后台接口

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/admin/upload-orders | 上传订单表 | 是 |
| POST | /api/admin/generate-pool | 生成大奖候选池 | 是 |
| GET | /api/admin/users | 用户列表 | 是 |
| GET | /api/admin/statistics | 统计数据 | 是 |
| GET | /api/admin/export | 导出中奖信息 | 是 |

---

## 五、页面清单

### 5.1 C端（用户侧）

| 页面路径 | 页面名称 | 功能描述 |
|---------|---------|---------|
| / | 首页 | 活动介绍、登录注册入口 |
| /register | 注册页 | 手机号、微信号、微博号、密码 |
| /login | 登录页 | 手机号+密码登录 |
| /dashboard | 用户主页 | 我的订单数、总金额、抽奖次数 |
| /bind | 绑定订单 | 批量输入订单号 |
| /lottery | 抽奖页 | 转盘抽奖、抽奖动画 |
| /my-records | 我的记录 | 抽奖历史、中奖记录 |

### 5.2 B端（管理后台）

| 页面路径 | 页面名称 | 功能描述 |
|---------|---------|---------|
| /admin | 仪表盘 | 参与人数、中奖率统计 |
| /admin/orders | 订单管理 | 上传订单Excel |
| /admin/users | 用户管理 | 查看用户绑定情况 |
| /admin/lottery | 大奖管理 | 生成候选池、抽取大奖 |
| /admin/winners | 中奖公示 | 实时滚动公布中奖名单 |

---

## 六、UI 设计规范

### 6.1 配色方案

| 用途 | 颜色 | 色值 |
|------|------|------|
| 主背景 | 深紫黑 | #0F0F1A |
| 卡片背景 | 深灰 | #1A1A2E |
| 主色调 | 金色 | #D4AF37 |
| 辅助色 | 渐变紫 | #6C5CE7 |
| 文字主色 | 白色 | #FFFFFF |
| 文字次色 | 浅灰 | #B0B0B0 |
| 成功色 | 翠绿 | #00D9A5 |
| 错误色 | 红色 | #FF6B6B |

### 6.2 字体规范

| 用途 | 字体 |
|------|------|
| 主标题 | Cinzel / Noto Serif SC |
| 正文 | Noto Sans SC |
| 数字 | DIN Alternate / Roboto Mono |

### 6.3 动效规范

| 动效类型 | 实现方式 | 时长 |
|---------|---------|------|
| 页面切换 | Fade + Slide | 300ms |
| 按钮悬停 | Scale 1.02 + Glow | 200ms |
| 抽奖转盘 | CSS Animation | 3-5s |
| 卡片浮起 | Transform Y-4px | 200ms |
| 粒子背景 | Canvas/Particles.js | 持续 |

### 6.4 响应式断点

| 设备 | 断点 | 布局 |
|------|------|------|
| 手机 | < 640px | 单列，底部导航 |
| 平板 | 640px - 1024px | 双列，简化侧栏 |
| 桌面 | > 1024px | 三列，完整侧栏 |

---

## 七、安全方案

| 风险 | 解决方案 |
|------|---------|
| 暴力注册 | 图形验证码 + IP频率限制 |
| 订单号滥用 | 一次性绑定，不可解绑 |
| 抽奖刷接口 | JWT + 服务端次数校验 + Rate Limit |
| 大奖作弊 | 大奖池生成后不可修改，抽奖结果记录 |
| 账号共享 | 登录IP异常检测 |
| XSS攻击 | 输入输出转义，CSP策略 |
| CSRF攻击 | JWT + SameSite Cookie |

### Rate Limit 配置

| 场景 | 限制 |
|------|------|
| 注册 | 同一IP 5次/小时 |
| 登录 | 同一IP 10次/分钟 |
| 抽奖 | 同一用户 1次/3秒 |

---

## 八、项目结构

```
lottery-system/
├── client/                      # Vue3 前端
│   ├── public/
│   ├── src/
│   │   ├── api/                 # 接口封装
│   │   ├── assets/              # 静态资源
│   │   ├── components/          # 通用组件
│   │   │   ├── common/          # 通用UI组件
│   │   │   └── lottery/         # 抽奖相关组件
│   │   ├── composables/         # 组合式函数
│   │   ├── layouts/             # 布局组件
│   │   ├── pages/               # 页面组件
│   │   │   ├── user/            # C端页面
│   │   │   └── admin/           # B端页面
│   │   ├── router/              # 路由配置
│   │   ├── stores/              # Pinia 状态管理
│   │   ├── styles/              # 全局样式
│   │   ├── utils/               # 工具函数
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Node.js 后端
│   ├── src/
│   │   ├── config/              # 配置文件
│   │   │   └── database.js      # MongoDB连接
│   │   ├── controllers/         # 控制器
│   │   │   ├── authController.js
│   │   │   ├── orderController.js
│   │   │   ├── lotteryController.js
│   │   │   └── adminController.js
│   │   ├── middleware/          # 中间件
│   │   │   ├── auth.js          # JWT认证
│   │   │   ├── rateLimit.js     # 频率限制
│   │   │   └── validator.js     # 数据校验
│   │   ├── models/              # 数据模型
│   │   │   ├── User.js
│   │   │   ├── Order.js
│   │   │   ├── LotteryRecord.js
│   │   │   ├── PrizeConfig.js
│   │   │   └── Admin.js
│   │   ├── routes/              # 路由
│   │   │   ├── auth.js
│   │   │   ├── orders.js
│   │   │   ├── lottery.js
│   │   │   └── admin.js
│   │   ├── utils/               # 工具函数
│   │   │   └── helpers.js
│   │   └── app.js               # 应用入口
│   ├── uploads/                 # 上传文件目录
│   ├── package.json
│   └── .env.example
│
├── SPEC.md                      # 方案文档
└── README.md                    # 项目说明
```

---

## 九、环境变量

### 9.1 后端 (.env)

```env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/lottery
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 9.2 前端 (.env)

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

---

## 十、部署流程

### 10.1 准备工作

1. 注册 GitHub 账号并创建仓库
2. 注册 MongoDB Atlas 并创建集群
3. 注册 Railway 账号（后端部署）
4. 注册 Vercel 账号（前端部署）

### 10.2 后端部署（Railway）

1. Railway 关联 GitHub 仓库
2. 选择 server 目录作为根目录
3. 配置环境变量（参考 9.1）
4. 等待自动部署，获取生产URL

### 10.3 前端部署（Vercel）

1. Vercel 导入前端 Git 仓库
2. 选择 client 目录
3. 配置环境变量 VITE_API_BASE_URL
4. 等待自动部署

### 10.4 数据库初始化

1. 连接 MongoDB Atlas
2. 创建 admin 管理员账号
3. 初始化 prize_config 配置

---

## 十一、需求确认（已确认）

- [x] 微店订单表格式：xlsx，第一列"订单编号"，第61列"结算金额"
- [x] 大奖公布方式：**实时滚动公布**（所有在线用户实时看到中奖信息）
- [x] 无安慰奖，只有大奖（一等奖1名、二等奖2名、三等奖2名）
- [x] 不需要短信验证码

---

## 十二、开发计划

### Phase 1: 基础架构（1天）
- [ ] 项目脚手架搭建
- [ ] 数据库模型设计
- [ ] 基础API实现

### Phase 2: 用户模块（1天）
- [ ] 注册/登录/登出
- [ ] 订单绑定

### Phase 3: 抽奖模块（1天）
- [ ] 抽奖次数计算
- [ ] 抽奖接口
- [ ] 抽奖动画

### Phase 4: 管理后台（1天）
- [ ] 订单上传
- [ ] 大奖池生成
- [ ] 中奖导出

### Phase 5: 部署上线（1天）
- [ ] 后端 Railway 部署
- [ ] 前端 Vercel 部署
- [ ] 域名绑定（可选）

---

*文档由 Claude Code 自动生成*
