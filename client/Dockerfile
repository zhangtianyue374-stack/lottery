# 前端 Dockerfile - Sealos 部署
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package.json
COPY client/package*.json ./

# 安装依赖
RUN npm install

# 复制源码
COPY client/src ./src
COPY client/public ./public
COPY client/index.html ./
COPY client/vite.config.js ./
COPY client/tailwind.config.js ./
COPY client/postcss.config.js ./

# 构建
RUN npm run build

# nginx 服务
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
