# Todo List 应用部署指南

本文档提供Todo List应用的完整部署流程，包括开发环境、测试环境和生产环境的部署说明。

---

## 目录

1. [系统要求](#系统要求)
2. [开发环境部署](#开发环境部署)
3. [生产环境部署](#生产环境部署)
4. [Docker部署](#docker部署)
5. [CI/CD配置](#cicd配置)
6. [故障排查](#故障排查)

---

## 系统要求

### 最低配置
- **CPU**: 2核心
- **内存**: 4GB RAM
- **硬盘**: 20GB SSD
- **网络**: 10Mbps

### 推荐配置
- **CPU**: 4核心
- **内存**: 8GB RAM
- **硬盘**: 50GB SSD
- **网络**: 100Mbps

### 软件要求
- **操作系统**: Linux (Ubuntu 20.04+) / Windows 10+ / macOS 10.15+
- **Node.js**: 18.x 或更高版本
- **PostgreSQL**: 14.x 或更高版本
- **Redis**: 6.x 或更高版本（可选，用于缓存）
- **Nginx**: 1.18+ （生产环境）

---

## 开发环境部署

### 1. 克隆代码

```bash
git clone https://github.com/your-repo/todo-list.git
cd todo-list
```

### 2. 安装PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
下载并安装 [PostgreSQL](https://www.postgresql.org/download/windows/)

### 3. 创建数据库

```bash
# 登录PostgreSQL
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE todo_list_db;
CREATE USER todo_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE todo_list_db TO todo_user;

# 退出
\q
```

### 4. 安装Redis（可选）

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

### 5. 后端部署

```bash
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env

# 编辑.env文件，配置数据库连接等
nano .env

# 运行数据库迁移
npm run migration:run

# 运行种子数据（可选）
npm run seed

# 启动开发服务器
npm run start:dev
```

后端服务将在 `http://localhost:3000` 启动。

### 6. 前端部署

```bash
cd client

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端应用将在 `http://localhost:5173` 启动。

---

## 生产环境部署

### 1. 服务器准备

#### 1.1 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.2 安装必要软件

```bash
# Node.js (使用NodeSource仓库)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PostgreSQL
sudo apt install postgresql postgresql-contrib

# Redis
sudo apt install redis-server

# Nginx
sudo apt install nginx

# PM2 (进程管理器)
sudo npm install -g pm2
```

### 2. 数据库配置

```bash
# 创建生产数据库
sudo -u postgres psql
CREATE DATABASE todo_list_prod;
CREATE USER todo_prod WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE todo_list_prod TO todo_prod;

# 配置PostgreSQL允许远程连接（如需要）
sudo nano /etc/postgresql/14/main/postgresql.conf
# 取消注释并修改: listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# 添加: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

### 3. 应用部署

#### 3.1 克隆代码

```bash
cd /var/www
sudo git clone https://github.com/your-repo/todo-list.git
sudo chown -R $USER:$USER todo-list
cd todo-list
```

#### 3.2 后端部署

```bash
cd server

# 安装依赖（生产模式）
npm ci --production

# 配置环境变量
nano .env.production
```

**生产环境变量配置 (.env.production)**:
```env
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=todo_prod
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_DATABASE=todo_list_prod
DB_POOL_MAX=50
DB_POOL_MIN=5

# JWT配置（使用强随机密钥）
JWT_SECRET=your-64-character-random-secret-key-here
JWT_REFRESH_SECRET=your-64-character-refresh-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 加密密钥
ENCRYPTION_KEY=your-encryption-key-here

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# CORS配置
CORS_ORIGIN=https://your-domain.com

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@your-domain.com

# API限流
THROTTLE_TTL=60000
THROTTLE_LIMIT=60

# API密钥
API_KEYS=key1,key2,key3
```

```bash
# 构建应用
npm run build

# 运行迁移
npm run migration:run

# 使用PM2启动
pm2 start dist/main.js --name todo-api
pm2 save
pm2 startup
```

#### 3.3 前端部署

```bash
cd ../client

# 安装依赖
npm ci

# 构建生产版本
npm run build
```

### 4. Nginx配置

#### 4.1 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/todo-list
```

```nginx
# HTTP服务器 - 重定向到HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS服务器
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL证书配置
    ssl_certificate /etc/ssl/certs/your-domain.com.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 前端静态文件
    root /var/www/todo-list/client/dist;
    index index.html;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # 日志
    access_log /var/log/nginx/todo-list-access.log;
    error_log /var/log/nginx/todo-list-error.log;
}
```

#### 4.2 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/todo-list /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

### 5. SSL证书配置

使用Let's Encrypt获取免费SSL证书：

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 6. 防火墙配置

```bash
# 允许SSH
sudo ufw allow ssh

# 允许HTTP/HTTPS
sudo ufw allow 'Nginx Full'

# 启用防火墙
sudo ufw enable
```

---

## Docker部署

### 1. 创建Dockerfile

**后端Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**前端Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose配置

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: todo_list_db
      POSTGRES_USER: todo_user
      POSTGRES_PASSWORD: todo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass redis_password
    ports:
      - "6379:6379"

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=todo_user
      - DB_PASSWORD=todo_password
      - DB_DATABASE=todo_list_db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=redis_password
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 3. 启动容器

```bash
# 构建和启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

---

## CI/CD配置

### GitHub Actions示例

`.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies (Backend)
      run: |
        cd server
        npm ci
    
    - name: Build Backend
      run: |
        cd server
        npm run build
    
    - name: Run tests
      run: |
        cd server
        npm test
    
    - name: Install dependencies (Frontend)
      run: |
        cd client
        npm ci
    
    - name: Build Frontend
      run: |
        cd client
        npm run build
    
    - name: Deploy to Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /var/www/todo-list
          git pull origin main
          cd server
          npm ci --production
          npm run build
          pm2 restart todo-api
          cd ../client
          npm ci
          npm run build
```

---

## 故障排查

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查连接
psql -h localhost -U todo_user -d todo_list_db

# 查看日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### 2. 后端服务无法启动

```bash
# 查看PM2日志
pm2 logs todo-api

# 检查端口占用
sudo lsof -i :3000

# 手动启动测试
cd /var/www/todo-list/server
node dist/main.js
```

#### 3. Nginx配置错误

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 重载配置
sudo systemctl reload nginx
```

#### 4. Redis连接问题

```bash
# 测试Redis连接
redis-cli ping

# 使用密码连接
redis-cli -a your_redis_password

# 查看Redis状态
sudo systemctl status redis
```

### 性能监控

```bash
# PM2监控
pm2 monit

# 系统资源
htop

# 磁盘使用
df -h

# 内存使用
free -m
```

---

## 备份和恢复

### 数据库备份

```bash
# 手动备份
pg_dump -U todo_prod todo_list_prod > backup_$(date +%Y%m%d).sql

# 自动备份脚本
cat > /usr/local/bin/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/todo-list"
mkdir -p $BACKUP_DIR
pg_dump -U todo_prod todo_list_prod | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-db.sh

# 添加到crontab
crontab -e
# 每天凌晨2点备份
0 2 * * * /usr/local/bin/backup-db.sh
```

### 数据库恢复

```bash
# 从备份恢复
psql -U todo_prod todo_list_prod < backup_20250101.sql
```

---

**文档版本**: 1.0  
**最后更新**: 2025-10-24  
**维护人员**: DevOps团队

