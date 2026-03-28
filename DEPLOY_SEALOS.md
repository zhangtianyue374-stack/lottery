# Sealos 部署配置

## 后端部署配置

```yaml
# 应用名称: lottery-api
# 镜像: node:18-alpine
# CPU: 0.5核
# 内存: 512Mi
# 端口: 3000

# 环境变量
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lottery
JWT_SECRET=lottery-jwt-secret-key-2026
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# 启动命令
npm install && npm start
```

## 前端部署配置

```yaml
# 应用名称: lottery-web
# 镜像: nginx:alpine
# CPU: 0.25核
# 内存: 256Mi
# 端口: 80

# 环境变量
VITE_API_BASE_URL=https://lottery-api.xxx.sealos.io/api

# 构建命令
npm install && npm run build

# 启动命令
npx serve -s dist -l 80
```

## 部署顺序

1. 先部署 MongoDB（如果使用 Sealos 内置）
2. 部署后端 lottery-api
3. 获取后端 URL
4. 部署前端 lottery-web（填入后端 URL）
