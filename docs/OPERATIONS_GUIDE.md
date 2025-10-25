# Todo List 应用运维指南

本文档面向运维人员，提供系统监控、维护、故障处理等操作指南。

---

## 目录

1. [日常运维](#日常运维)
2. [监控告警](#监控告警)
3. [日志管理](#日志管理)
4. [备份恢复](#备份恢复)
5. [故障处理](#故障处理)
6. [性能调优](#性能调优)
7. [安全运维](#安全运维)

---

## 日常运维

### 1.1 服务管理

#### 后端服务（PM2）

```bash
# 查看服务状态
pm2 status

# 查看详细信息
pm2 show todo-api

# 重启服务
pm2 restart todo-api

# 停止服务
pm2 stop todo-api

# 启动服务
pm2 start todo-api

# 删除服务
pm2 delete todo-api

# 查看日志
pm2 logs todo-api

# 实时监控
pm2 monit
```

#### 数据库服务

```bash
# 查看PostgreSQL状态
sudo systemctl status postgresql

# 启动PostgreSQL
sudo systemctl start postgresql

# 停止PostgreSQL
sudo systemctl stop postgresql

# 重启PostgreSQL
sudo systemctl restart postgresql

# 查看PostgreSQL日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```

#### Redis服务

```bash
# 查看Redis状态
sudo systemctl status redis

# 连接Redis
redis-cli

# 使用密码连接
redis-cli -a your_password

# 检查Redis信息
redis-cli INFO

# 清空缓存（谨慎使用）
redis-cli FLUSHALL
```

#### Nginx服务

```bash
# 查看Nginx状态
sudo systemctl status nginx

# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启Nginx
sudo systemctl restart nginx

# 查看访问日志
sudo tail -f /var/log/nginx/todo-list-access.log

# 查看错误日志
sudo tail -f /var/log/nginx/todo-list-error.log
```

### 1.2 健康检查

#### 自动化健康检查脚本

创建 `/usr/local/bin/health-check.sh`:

```bash
#!/bin/bash

# 检查API健康
check_api() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health)
    if [ $response -eq 200 ]; then
        echo "✓ API服务正常"
        return 0
    else
        echo "✗ API服务异常: HTTP $response"
        return 1
    fi
}

# 检查数据库连接
check_database() {
    if sudo -u postgres psql -U todo_prod -d todo_list_prod -c "SELECT 1" > /dev/null 2>&1; then
        echo "✓ 数据库连接正常"
        return 0
    else
        echo "✗ 数据库连接失败"
        return 1
    fi
}

# 检查Redis
check_redis() {
    if redis-cli ping > /dev/null 2>&1; then
        echo "✓ Redis服务正常"
        return 0
    else
        echo "✗ Redis服务异常"
        return 1
    fi
}

# 检查磁盘空间
check_disk() {
    usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $usage -lt 80 ]; then
        echo "✓ 磁盘空间充足 ($usage%)"
        return 0
    else
        echo "⚠ 磁盘空间不足 ($usage%)"
        return 1
    fi
}

# 执行所有检查
echo "=== 系统健康检查 ==="
echo "时间: $(date)"
echo ""

check_api
check_database
check_redis
check_disk

echo ""
echo "=== 检查完成 ==="
```

添加到crontab（每5分钟检查一次）:
```bash
chmod +x /usr/local/bin/health-check.sh
crontab -e
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## 监控告警

### 2.1 系统监控

#### 资源使用监控

```bash
# CPU使用率
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}'

# 内存使用率
free | grep Mem | awk '{print ($3/$2) * 100.0}'

# 磁盘使用率
df -h | grep '/dev/sda' | awk '{print $5}'

# 网络流量
ifstat 1 1
```

#### PM2监控

```bash
# 安装PM2监控模块
pm2 install pm2-server-monit

# 查看监控数据
pm2 web
# 访问 http://localhost:9615
```

### 2.2 应用监控

#### API响应时间监控

创建 `/usr/local/bin/monitor-api.sh`:

```bash
#!/bin/bash

endpoints=(
    "/api/v1/health"
    "/api/v1/tasks"
    "/api/v1/statistics/overview"
)

for endpoint in "${endpoints[@]}"; do
    response_time=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:3000$endpoint")
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $endpoint: ${response_time}s"
done
```

#### 数据库性能监控

```sql
-- 查看活跃连接数
SELECT count(*) FROM pg_stat_activity 
WHERE state = 'active';

-- 查看慢查询
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 2.3 告警配置

#### 邮件告警脚本

创建 `/usr/local/bin/send-alert.sh`:

```bash
#!/bin/bash

SUBJECT="$1"
MESSAGE="$2"
EMAIL="admin@your-domain.com"

echo "$MESSAGE" | mail -s "$SUBJECT" "$EMAIL"
```

#### 告警触发条件

```bash
# CPU使用率超过80%告警
cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    /usr/local/bin/send-alert.sh "CPU高负载告警" "当前CPU使用率: $cpu_usage%"
fi

# 磁盘空间不足20%告警
disk_free=$(df / | awk 'NR==2 {print $4}')
if [ $disk_free -lt 20 ]; then
    /usr/local/bin/send-alert.sh "磁盘空间告警" "剩余空间: $disk_free%"
fi

# API响应超时告警
response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/api/v1/health)
if (( $(echo "$response_time > 1.0" | bc -l) )); then
    /usr/local/bin/send-alert.sh "API响应慢" "响应时间: ${response_time}s"
fi
```

---

## 日志管理

### 3.1 日志位置

```
应用日志:      ~/.pm2/logs/
Nginx日志:    /var/log/nginx/
PostgreSQL日志: /var/log/postgresql/
系统日志:      /var/log/syslog
健康检查日志:   /var/log/health-check.log
```

### 3.2 日志查看

```bash
# 查看PM2日志
pm2 logs todo-api --lines 100

# 查看Nginx访问日志
sudo tail -f /var/log/nginx/todo-list-access.log

# 查看Nginx错误日志
sudo tail -f /var/log/nginx/todo-list-error.log

# 查看PostgreSQL日志
sudo tail -f /var/log/postgresql/postgresql-14-main.log

# 过滤错误日志
sudo grep ERROR /var/log/nginx/todo-list-error.log

# 统计访问量
sudo awk '{print $1}' /var/log/nginx/todo-list-access.log | sort | uniq -c | sort -nr | head -10
```

### 3.3 日志轮转

Nginx日志轮转（已自动配置）:
```bash
# 查看配置
cat /etc/logrotate.d/nginx

# 手动触发轮转
sudo logrotate -f /etc/logrotate.d/nginx
```

应用日志轮转（PM2自动处理）:
```bash
# PM2日志轮转配置
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 3.4 日志分析

```bash
# 统计请求状态码分布
sudo awk '{print $9}' /var/log/nginx/todo-list-access.log | sort | uniq -c

# 统计最常访问的API
sudo awk '{print $7}' /var/log/nginx/todo-list-access.log | grep '/api' | sort | uniq -c | sort -nr | head -10

# 统计错误请求
sudo awk '$9 >= 400' /var/log/nginx/todo-list-access.log | wc -l

# 统计IP访问次数
sudo awk '{print $1}' /var/log/nginx/todo-list-access.log | sort | uniq -c | sort -nr | head -20
```

---

## 备份恢复

### 4.1 自动备份

#### 数据库备份脚本

`/usr/local/bin/backup-database.sh`:

```bash
#!/bin/bash

# 配置
BACKUP_DIR="/var/backups/todo-list/database"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="todo_list_prod"
DB_USER="todo_prod"
RETENTION_DAYS=30

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
echo "开始备份数据库: $DB_NAME"
pg_dump -U $DB_USER -F c -b -v -f "$BACKUP_DIR/db_backup_$DATE.dump" $DB_NAME

# 压缩备份
gzip "$BACKUP_DIR/db_backup_$DATE.dump"

# 删除旧备份
find $BACKUP_DIR -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete

echo "备份完成: db_backup_$DATE.dump.gz"
```

#### 应用文件备份

`/usr/local/bin/backup-files.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/todo-list/files"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/todo-list"

mkdir -p $BACKUP_DIR

# 备份应用文件（不包含node_modules）
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    $APP_DIR

# 删除30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "文件备份完成: app_backup_$DATE.tar.gz"
```

#### 添加到计划任务

```bash
# 编辑crontab
crontab -e

# 每天凌晨2点备份数据库
0 2 * * * /usr/local/bin/backup-database.sh >> /var/log/backup.log 2>&1

# 每周日凌晨3点备份文件
0 3 * * 0 /usr/local/bin/backup-files.sh >> /var/log/backup.log 2>&1
```

### 4.2 数据恢复

#### 数据库恢复

```bash
# 列出备份文件
ls -lh /var/backups/todo-list/database/

# 解压备份
gunzip /var/backups/todo-list/database/db_backup_20250101_020000.dump.gz

# 恢复数据库（方式1：覆盖）
pg_restore -U todo_prod -d todo_list_prod -c -v \
    /var/backups/todo-list/database/db_backup_20250101_020000.dump

# 恢复数据库（方式2：新建数据库）
createdb -U todo_prod todo_list_restore
pg_restore -U todo_prod -d todo_list_restore -v \
    /var/backups/todo-list/database/db_backup_20250101_020000.dump
```

#### 应用文件恢复

```bash
# 停止应用
pm2 stop todo-api

# 备份当前文件
mv /var/www/todo-list /var/www/todo-list.old

# 解压备份
tar -xzf /var/backups/todo-list/files/app_backup_20250101_030000.tar.gz -C /var/www/

# 重新安装依赖
cd /var/www/todo-list/server
npm install

# 启动应用
pm2 start todo-api
```

### 4.3 远程备份

```bash
# 上传到云存储（以AWS S3为例）
aws s3 sync /var/backups/todo-list/ s3://your-bucket/todo-list-backups/

# 使用rsync同步到备份服务器
rsync -avz /var/backups/todo-list/ backup-server:/backups/todo-list/
```

---

## 故障处理

### 5.1 常见故障处理流程

#### 应用无响应

```bash
# 1. 检查进程状态
pm2 status

# 2. 查看日志
pm2 logs todo-api --lines 50

# 3. 检查端口占用
sudo lsof -i :3000

# 4. 检查系统资源
htop

# 5. 尝试重启
pm2 restart todo-api

# 6. 如果还是失败，查看详细错误
pm2 logs todo-api --err
```

#### 数据库连接失败

```bash
# 1. 检查PostgreSQL服务
sudo systemctl status postgresql

# 2. 检查连接数
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# 3. 检查最大连接数
sudo -u postgres psql -c "SHOW max_connections;"

# 4. 杀死空闲连接（如果连接数满了）
sudo -u postgres psql -c "
    SELECT pg_terminate_backend(pid) 
    FROM pg_stat_activity 
    WHERE datname = 'todo_list_prod' 
    AND state = 'idle' 
    AND state_change < current_timestamp - INTERVAL '5 minutes';"

# 5. 重启PostgreSQL（最后手段）
sudo systemctl restart postgresql
```

#### Redis连接失败

```bash
# 1. 检查Redis服务
sudo systemctl status redis

# 2. 测试连接
redis-cli ping

# 3. 检查内存使用
redis-cli INFO memory

# 4. 重启Redis
sudo systemctl restart redis
```

#### Nginx 502错误

```bash
# 1. 检查后端服务是否运行
pm2 status

# 2. 检查Nginx配置
sudo nginx -t

# 3. 查看Nginx错误日志
sudo tail -50 /var/log/nginx/todo-list-error.log

# 4. 重启服务
pm2 restart todo-api
sudo systemctl reload nginx
```

### 5.2 应急预案

#### 高负载应急

```bash
# 1. 识别资源消耗进程
top -c

# 2. 临时增加连接池
# 编辑server/.env
DB_POOL_MAX=100

# 3. 清理Redis缓存
redis-cli FLUSHALL

# 4. 重启应用
pm2 restart todo-api
```

#### 磁盘空间不足

```bash
# 1. 查看磁盘使用
df -h

# 2. 查找大文件
du -sh /* | sort -hr | head -10

# 3. 清理日志
sudo journalctl --vacuum-time=7d
find /var/log -name "*.log" -mtime +30 -delete

# 4. 清理PM2日志
pm2 flush

# 5. 清理旧备份
find /var/backups -mtime +60 -delete
```

---

## 性能调优

### 6.1 数据库调优

#### PostgreSQL配置优化

编辑 `/etc/postgresql/14/main/postgresql.conf`:

```conf
# 内存设置（假设8GB RAM）
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 16MB

# 连接设置
max_connections = 200

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200

# WAL设置
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# 检查点
checkpoint_completion_target = 0.9
```

重启PostgreSQL:
```bash
sudo systemctl restart postgresql
```

#### 定期维护

```sql
-- 分析表
ANALYZE tasks;
ANALYZE users;

-- 清理
VACUUM ANALYZE tasks;

-- 重建索引
REINDEX TABLE tasks;
```

### 6.2 应用调优

#### PM2集群模式

```bash
# 停止当前服务
pm2 delete todo-api

# 启动集群模式（根据CPU核心数）
pm2 start dist/main.js \
    --name todo-api \
    -i max \
    --max-memory-restart 500M

# 保存配置
pm2 save
```

### 6.3 Nginx调优

编辑 `/etc/nginx/nginx.conf`:

```nginx
user www-data;
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
}

http {
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # 缓冲区
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/json;
}
```

---

## 安全运维

### 7.1 安全检查清单

```bash
# 1. 检查开放端口
sudo netstat -tulpn

# 2. 检查防火墙规则
sudo ufw status

# 3. 检查失败登录尝试
sudo grep "Failed password" /var/log/auth.log | tail -20

# 4. 检查sudo使用记录
sudo grep sudo /var/log/auth.log | tail -20

# 5. 检查异常进程
ps aux | grep -v USER | awk '{if($3>50.0) print $0}'
```

### 7.2 定期安全任务

```bash
# 系统更新（每周）
sudo apt update && sudo apt upgrade -y

# 检查依赖漏洞（每周）
cd /var/www/todo-list/server && npm audit
cd /var/www/todo-list/client && npm audit

# SSL证书更新（每3个月，自动）
sudo certbot renew

# 密码轮换（每季度）
# 更新数据库密码
# 更新JWT密钥
# 更新Redis密码
```

### 7.3 访问控制

```bash
# 限制SSH访问
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

# 配置fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 运维工具推荐

### 监控工具
- **Prometheus + Grafana**: 指标监控和可视化
- **PM2 Plus**: PM2高级监控
- **Datadog**: 全栈监控
- **New Relic**: APM性能监控

### 日志工具
- **ELK Stack**: Elasticsearch + Logstash + Kibana
- **Graylog**: 日志管理
- **Loki**: 轻量级日志聚合

### 告警工具
- **PagerDuty**: 事故管理
- **OpsGenie**: 告警管理
- **Slack**: 团队协作告警

---

## 联系方式

**运维团队**: ops@your-domain.com  
**应急热线**: +86 xxx-xxxx-xxxx  
**值班安排**: 查看团队日历

---

**文档版本**: 1.0  
**最后更新**: 2025-10-24  
**维护**: 运维团队

