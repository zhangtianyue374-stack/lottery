# 后端 Dockerfile - Sealos 部署
FROM node:18-alpine

WORKDIR /app

# 复制 package.json
COPY server/package*.json ./

# 安装依赖
RUN npm install

# 复制源码
COPY server/src ./src

# 暴露端口
EXPOSE 3000

# 启动
CMD ["npm", "start"]
