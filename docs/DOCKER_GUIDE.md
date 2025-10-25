# Docker 部署指南

本文档说明如何使用Docker部署Todo List应用。

---

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 安装Docker

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS/Windows:**
下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## 开发环境部署

### 1. 启动所有服务

```bash
# 使用开发配置启动
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# 后台运行
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 查看日志
docker-compose logs -f
```

### 2. 停止服务

```bash
docker-compose down

# 同时删除数据卷
docker-compose down -v
```

---

## 生产环境部署

### 1. 配置环境变量

创建 `.env` 文件：

```env
# 数据库
DB_DATABASE=todo_list_prod
DB_USERNAME=todo_prod
DB_PASSWORD=STRONG_PASSWORD_HERE

# Redis
REDIS_PASSWORD=REDIS_STRONG_PASSWORD

# JWT
JWT_SECRET=YOUR_JWT_SECRET_KEY
JWT_REFRESH_SECRET=YOUR_REFRESH_SECRET_KEY

# 加密
ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY

# CORS
CORS_ORIGIN=https://your-domain.com

# API
VITE_API_URL=https://api.your-domain.com/api/v1
```

### 2. 构建镜像

```bash
# 构建所有服务
docker-compose build

# 只构建特定服务
docker-compose build backend
docker-compose build frontend
```

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f backend
```

### 4. 初始化数据库

```bash
# 进入backend容器
docker-compose exec backend sh

# 运行迁移
npm run migration:run

# 运行种子数据（可选）
npm run seed

# 退出容器
exit
```

---

## Docker命令参考

### 服务管理

```bash
# 启动服务
docker-compose up -d [service]

# 停止服务
docker-compose stop [service]

# 重启服务
docker-compose restart [service]

# 删除服务
docker-compose rm [service]

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service]
```

### 镜像管理

```bash
# 列出镜像
docker images

# 构建镜像
docker-compose build [service]

# 拉取镜像
docker-compose pull

# 删除未使用的镜像
docker image prune

# 删除所有未使用的镜像
docker image prune -a
```

### 容器管理

```bash
# 进入容器
docker-compose exec [service] sh

# 执行命令
docker-compose exec backend npm run migration:run

# 查看容器资源使用
docker stats

# 查看容器详情
docker inspect [container_id]
```

### 数据卷管理

```bash
# 列出数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect [volume_name]

# 删除数据卷
docker volume rm [volume_name]

# 删除未使用的数据卷
docker volume prune
```

---

## 常见任务

### 备份数据库

```bash
# 备份PostgreSQL
docker-compose exec postgres pg_dump -U todo_user todo_list_db > backup_$(date +%Y%m%d).sql

# 或使用docker cp
docker-compose exec postgres pg_dump -U todo_user todo_list_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 恢复数据库

```bash
# 从备份恢复
docker-compose exec -T postgres psql -U todo_user todo_list_db < backup_20250101.sql

# 从压缩备份恢复
gunzip < backup_20250101.sql.gz | docker-compose exec -T postgres psql -U todo_user todo_list_db
```

### 更新应用

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新构建镜像
docker-compose build

# 3. 重启服务
docker-compose up -d

# 4. 运行数据库迁移
docker-compose exec backend npm run migration:run
```

### 清理系统

```bash
# 清理所有未使用的资源
docker system prune

# 清理所有资源（包括未使用的镜像）
docker system prune -a

# 查看磁盘使用
docker system df
```

---

## 监控和调试

### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# 特定服务日志
docker-compose logs -f backend

# 最近100行日志
docker-compose logs --tail=100 backend

# 实时查看新日志
docker-compose logs -f --tail=0 backend
```

### 健康检查

```bash
# 查看健康状态
docker-compose ps

# 检查特定容器健康
docker inspect --format='{{.State.Health.Status}}' todo-backend
```

### 性能监控

```bash
# 查看资源使用
docker stats

# 查看特定容器
docker stats todo-backend

# 查看容器进程
docker-compose top
```

---

## 网络配置

### 查看网络

```bash
# 列出网络
docker network ls

# 查看网络详情
docker network inspect dang_todo-network
```

### 连接到网络

```bash
# 连接容器到网络
docker network connect todo-network [container]

# 断开连接
docker network disconnect todo-network [container]
```

---

## 生产环境最佳实践

### 1. 使用特定版本标签

```yaml
services:
  postgres:
    image: postgres:14.5-alpine  # 使用特定版本
```

### 2. 限制资源使用

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### 3. 配置日志

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 4. 健康检查

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### 5. 重启策略

```yaml
services:
  backend:
    restart: unless-stopped  # 或 always, on-failure
```

---

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 查看容器事件
docker events --filter container=todo-backend

# 检查配置
docker-compose config
```

### 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose ps postgres

# 测试数据库连接
docker-compose exec backend sh -c 'nc -zv postgres 5432'

# 进入数据库容器
docker-compose exec postgres psql -U todo_user -d todo_list_db
```

### Redis连接失败

```bash
# 检查Redis状态
docker-compose exec redis redis-cli ping

# 使用密码连接
docker-compose exec redis redis-cli -a your_password ping
```

### 端口冲突

```bash
# 查看端口占用
sudo netstat -tulpn | grep :3000

# 修改docker-compose.yml中的端口映射
ports:
  - "3001:3000"  # 改用3001端口
```

---

## Docker Compose配置说明

### 服务说明

| 服务 | 端口 | 说明 |
|------|------|------|
| postgres | 5432 | PostgreSQL数据库 |
| redis | 6379 | Redis缓存 |
| backend | 3000 | NestJS后端API |
| frontend | 80 | React前端应用 |

### 数据卷

| 卷名 | 挂载点 | 说明 |
|------|--------|------|
| postgres_data | /var/lib/postgresql/data | 数据库数据 |
| redis_data | /data | Redis数据 |
| uploads | /app/uploads | 上传文件 |

### 网络

- `todo-network`: 桥接网络，连接所有服务

---

## 安全建议

1. **不要在生产环境暴露数据库端口**
   ```yaml
   # 移除端口映射
   # ports:
   #   - "5432:5432"
   ```

2. **使用密钥管理工具**
   - 使用Docker Secrets或环境变量文件

3. **定期更新镜像**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

4. **限制容器权限**
   ```yaml
   services:
     backend:
       security_opt:
         - no-new-privileges:true
       read_only: true
   ```

---

## 参考资源

- [Docker文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [最佳实践](https://docs.docker.com/develop/dev-best-practices/)

---

**文档版本**: 1.0  
**最后更新**: 2025-10-24

