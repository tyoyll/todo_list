# 环境配置指南

本文档说明如何配置Todo List应用的环境变量。

---

## 后端环境变量配置

### 开发环境 (server/.env)

```env
# 应用配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DATABASE=todo_list_db

# 数据库连接池
DB_POOL_MAX=20
DB_POOL_MIN=2

# JWT配置
# 使用以下命令生成随机密钥：
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_jwt_secret_key_min_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_min_32_characters
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 加密密钥
# 使用以下命令生成：
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_encryption_key_32_bytes_hex

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# CORS配置
CORS_ORIGIN=http://localhost:5173

# 速率限制配置
THROTTLE_TTL=60000
THROTTLE_LIMIT=100

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@todolist.com

# API密钥（逗号分隔）
API_KEYS=key1,key2,key3

# 文件上传
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### 生产环境 (server/.env.production)

```env
# 应用配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=todo_prod
DB_PASSWORD=STRONG_PRODUCTION_PASSWORD_HERE
DB_DATABASE=todo_list_prod

# 数据库连接池（生产环境建议更大）
DB_POOL_MAX=50
DB_POOL_MIN=5

# JWT配置（生产环境必须使用强随机密钥）
JWT_SECRET=GENERATE_STRONG_RANDOM_64_CHAR_KEY_HERE
JWT_REFRESH_SECRET=GENERATE_STRONG_RANDOM_64_CHAR_KEY_HERE
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# 加密密钥（生产环境必须使用强随机密钥）
ENCRYPTION_KEY=GENERATE_STRONG_32_BYTE_HEX_KEY_HERE

# Redis配置
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=REDIS_STRONG_PASSWORD
REDIS_DB=0

# CORS配置（只允许生产域名）
CORS_ORIGIN=https://your-domain.com

# 速率限制配置（生产环境可以更严格）
THROTTLE_TTL=60000
THROTTLE_LIMIT=60

# 邮件配置
MAIL_HOST=smtp.your-mail-provider.com
MAIL_PORT=587
MAIL_USER=noreply@your-domain.com
MAIL_PASSWORD=MAIL_SERVICE_PASSWORD
MAIL_FROM=noreply@your-domain.com

# API密钥
API_KEYS=prod_key_1,prod_key_2

# 文件上传
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/uploads/todo-list

# 日志级别
LOG_LEVEL=info

# 监控和性能
ENABLE_QUERY_LOGGING=false
SLOW_QUERY_THRESHOLD=1000
```

---

## 前端环境变量配置

### 开发环境 (client/.env)

```env
# API配置
VITE_API_URL=http://localhost:3000/api/v1

# 应用配置
VITE_APP_NAME=Todo List
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 生产环境 (client/.env.production)

```env
# API配置
VITE_API_URL=https://api.your-domain.com/api/v1

# 应用配置
VITE_APP_NAME=Todo List
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# CDN配置（可选）
# VITE_CDN_URL=https://cdn.your-domain.com
```

---

## 环境变量说明

### 后端环境变量

| 变量名 | 说明 | 必填 | 默认值 |
|--------|------|------|--------|
| NODE_ENV | 运行环境 | 是 | development |
| PORT | 应用端口 | 否 | 3000 |
| DB_HOST | 数据库主机 | 是 | localhost |
| DB_PORT | 数据库端口 | 否 | 5432 |
| DB_USERNAME | 数据库用户名 | 是 | - |
| DB_PASSWORD | 数据库密码 | 是 | - |
| DB_DATABASE | 数据库名称 | 是 | - |
| DB_POOL_MAX | 最大连接数 | 否 | 20 |
| DB_POOL_MIN | 最小连接数 | 否 | 2 |
| JWT_SECRET | JWT密钥 | 是 | - |
| JWT_REFRESH_SECRET | JWT刷新密钥 | 是 | - |
| JWT_EXPIRES_IN | Token过期时间 | 否 | 1h |
| JWT_REFRESH_EXPIRES_IN | 刷新Token过期时间 | 否 | 7d |
| ENCRYPTION_KEY | 加密密钥 | 是 | - |
| REDIS_HOST | Redis主机 | 否 | localhost |
| REDIS_PORT | Redis端口 | 否 | 6379 |
| REDIS_PASSWORD | Redis密码 | 否 | - |
| REDIS_DB | Redis数据库编号 | 否 | 0 |
| CORS_ORIGIN | 允许的跨域来源 | 是 | - |
| THROTTLE_TTL | 限流时间窗口(ms) | 否 | 60000 |
| THROTTLE_LIMIT | 限流请求数 | 否 | 100 |
| MAIL_HOST | 邮件服务器 | 否 | - |
| MAIL_PORT | 邮件端口 | 否 | 587 |
| MAIL_USER | 邮件用户名 | 否 | - |
| MAIL_PASSWORD | 邮件密码 | 否 | - |
| MAIL_FROM | 发件人地址 | 否 | - |
| API_KEYS | API密钥列表 | 否 | - |
| MAX_FILE_SIZE | 最大文件大小(字节) | 否 | 10485760 |
| UPLOAD_DIR | 上传目录 | 否 | ./uploads |

### 前端环境变量

| 变量名 | 说明 | 必填 | 默认值 |
|--------|------|------|--------|
| VITE_API_URL | 后端API地址 | 是 | - |
| VITE_APP_NAME | 应用名称 | 否 | Todo List |
| VITE_APP_VERSION | 应用版本 | 否 | 1.0.0 |
| VITE_ENABLE_ANALYTICS | 启用分析 | 否 | false |
| VITE_ENABLE_DEBUG | 启用调试 | 否 | false |

---

## 密钥生成

### 生成JWT密钥

```bash
# 生成64字节的随机密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 生成加密密钥

```bash
# 生成32字节的随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 生成API密钥

```bash
# 生成16字节的随机密钥
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 配置步骤

### 1. 后端配置

```bash
# 进入后端目录
cd server

# 复制环境变量模板（手动创建.env文件）
# 开发环境
# 创建 .env 文件，复制上面的开发环境配置

# 生成密钥
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"

# 编辑 .env 文件，填入生成的密钥和其他配置
```

### 2. 前端配置

```bash
# 进入前端目录
cd client

# 创建 .env 文件
# 复制上面的开发环境配置
```

### 3. 数据库配置

```bash
# 创建数据库
sudo -u postgres psql
CREATE DATABASE todo_list_db;
CREATE USER todo_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE todo_list_db TO todo_user;
\q

# 更新 .env 中的数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=todo_user
DB_PASSWORD=your_password
DB_DATABASE=todo_list_db
```

### 4. Redis配置（可选）

```bash
# 安装Redis
sudo apt install redis-server

# 如果需要密码保护
sudo nano /etc/redis/redis.conf
# 取消注释并设置: requirepass your_redis_password

# 重启Redis
sudo systemctl restart redis

# 更新 .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
```

---

## 生产环境特别注意

### 安全检查清单

- [ ] 使用强随机密钥（不要使用示例密钥）
- [ ] JWT密钥长度至少64字符
- [ ] 数据库密码强度高（至少16字符，包含大小写、数字、特殊字符）
- [ ] Redis启用密码保护
- [ ] CORS只允许生产域名
- [ ] 邮件配置使用应用专用密码
- [ ] API密钥定期轮换
- [ ] 不要将.env文件提交到版本控制
- [ ] 生产环境关闭调试模式
- [ ] 配置合适的速率限制

### 密钥管理建议

1. **使用密钥管理服务**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault

2. **环境隔离**
   - 开发、测试、生产环境使用不同的密钥
   - 每个环境的数据库完全隔离

3. **密钥轮换**
   - 定期更换密钥（建议每3-6个月）
   - 密钥泄露时立即更换

4. **访问控制**
   - 限制能访问生产环境配置的人员
   - 使用最小权限原则

---

## 环境变量验证

### 后端验证脚本

创建 `server/scripts/check-env.js`:

```javascript
const crypto = require('crypto');
const fs = require('fs');

console.log('🔍 检查环境变量配置...\n');

const requiredVars = [
  'DB_HOST',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'CORS_ORIGIN',
];

let hasErrors = false;

// 检查必填变量
requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ 缺少必填环境变量: ${varName}`);
    hasErrors = true;
  } else {
    console.log(`✓ ${varName}`);
  }
});

// 检查密钥强度
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn(`⚠️  JWT_SECRET 长度不足（当前: ${process.env.JWT_SECRET.length}，建议: 64+）`);
}

if (process.env.NODE_ENV === 'production') {
  // 生产环境额外检查
  if (process.env.CORS_ORIGIN === 'http://localhost:5173') {
    console.error('❌ 生产环境不应使用localhost作为CORS_ORIGIN');
    hasErrors = true;
  }
  
  if (!process.env.REDIS_PASSWORD) {
    console.warn('⚠️  生产环境建议配置Redis密码');
  }
}

if (hasErrors) {
  console.error('\n❌ 环境变量配置有误，请检查！');
  process.exit(1);
} else {
  console.log('\n✅ 环境变量配置检查通过！');
}
```

运行验证：
```bash
node scripts/check-env.js
```

---

## 故障排查

### 常见问题

**Q: 应用无法连接数据库？**
```bash
# 检查环境变量
echo $DB_HOST
echo $DB_USERNAME

# 测试数据库连接
psql -h $DB_HOST -U $DB_USERNAME -d $DB_DATABASE
```

**Q: JWT认证失败？**
- 检查JWT_SECRET是否配置
- 确认前后端使用相同的API地址
- 检查Token是否过期

**Q: CORS错误？**
- 检查CORS_ORIGIN是否包含前端域名
- 生产环境使用https而非http

**Q: Redis连接失败？**
- 检查Redis服务是否运行
- 验证REDIS_PASSWORD是否正确

---

**文档版本**: 1.0  
**最后更新**: 2025-10-24

