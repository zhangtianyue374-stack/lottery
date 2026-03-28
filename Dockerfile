# 前端 Dockerfile
# 阶段1: 构建
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源码
COPY . .

# 构建生产版本
RUN npm run build

# 阶段2: nginx 服务
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
