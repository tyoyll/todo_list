# 密码重置功能测试指南

## 功能概述
本文档提供密码重置功能的测试步骤和预期结果。

## 准备工作

1. 确保数据库已启动并连接成功
2. 配置 `.env` 文件中的邮件设置（参考 `PASSWORD_RESET_SETUP.md`）
3. 启动后端服务器：`npm run start:dev`
4. 准备 API 测试工具（如 Postman、Thunder Client 或 curl）

## 测试场景

### 场景 1：请求密码重置（成功）

**前置条件**：用户已注册，邮箱为 `test@example.com`

**请求**：
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**预期响应**：
```json
{
  "message": "如果该邮箱已注册，你将收到密码重置邮件"
}
```

**验证**：
- ✓ 返回 200 状态码
- ✓ 用户收到密码重置邮件
- ✓ 邮件包含重置链接
- ✓ 数据库中 `resetPasswordToken` 和 `resetPasswordExpires` 字段已填充

### 场景 2：请求密码重置（邮箱不存在）

**请求**：
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com"
  }'
```

**预期响应**：
```json
{
  "message": "如果该邮箱已注册，你将收到密码重置邮件"
}
```

**验证**：
- ✓ 返回 200 状态码（安全考虑，不暴露用户是否存在）
- ✓ 不发送邮件
- ✓ 数据库无变化

### 场景 3：验证重置令牌（有效）

**前置条件**：已获得有效的重置令牌

**请求**：
```bash
curl -X GET "http://localhost:3000/auth/verify-reset-token?token=YOUR_TOKEN_HERE"
```

**预期响应**：
```json
{
  "valid": true,
  "email": "test@example.com"
}
```

**验证**：
- ✓ 返回 200 状态码
- ✓ 返回有效标志和用户邮箱

### 场景 4：验证重置令牌（无效或过期）

**请求**：
```bash
curl -X GET "http://localhost:3000/auth/verify-reset-token?token=invalid-token"
```

**预期响应**：
```json
{
  "statusCode": 400,
  "message": "重置令牌无效或已过期",
  "error": "Bad Request"
}
```

**验证**：
- ✓ 返回 400 状态码
- ✓ 返回错误消息

### 场景 5：重置密码（成功）

**前置条件**：已获得有效的重置令牌

**请求**：
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "newPassword": "newPassword123"
  }'
```

**预期响应**：
```json
{
  "message": "密码重置成功，请使用新密码登录"
}
```

**验证**：
- ✓ 返回 200 状态码
- ✓ 数据库中密码已更新
- ✓ `resetPasswordToken` 和 `resetPasswordExpires` 已清空
- ✓ 用户收到密码重置成功通知邮件
- ✓ 可以使用新密码登录

### 场景 6：重置密码（密码格式不合法）

**请求**：
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "newPassword": "123"
  }'
```

**预期响应**：
```json
{
  "statusCode": 400,
  "message": [
    "密码长度至少为6个字符",
    "密码必须包含字母和数字"
  ],
  "error": "Bad Request"
}
```

**验证**：
- ✓ 返回 400 状态码
- ✓ 返回验证错误消息
- ✓ 密码未被更新

### 场景 7：重复使用重置令牌

**前置条件**：令牌已被使用一次

**请求**：
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "USED_TOKEN",
    "newPassword": "anotherPassword123"
  }'
```

**预期响应**：
```json
{
  "statusCode": 400,
  "message": "重置令牌无效或已过期",
  "error": "Bad Request"
}
```

**验证**：
- ✓ 返回 400 状态码
- ✓ 令牌不能被重复使用

### 场景 8：令牌过期

**前置条件**：等待令牌过期（1 小时后）

**请求**：
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "EXPIRED_TOKEN",
    "newPassword": "newPassword123"
  }'
```

**预期响应**：
```json
{
  "statusCode": 400,
  "message": "重置令牌无效或已过期",
  "error": "Bad Request"
}
```

**验证**：
- ✓ 返回 400 状态码
- ✓ 过期令牌不能使用

## 完整流程测试

### 测试步骤：

1. **注册新用户**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "nickname": "Test User"
  }'
```

2. **请求密码重置**
```bash
curl -X POST http://localhost:3000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

3. **检查邮箱**，获取重置链接中的 token

4. **验证令牌**
```bash
curl -X GET "http://localhost:3000/auth/verify-reset-token?token=YOUR_TOKEN"
```

5. **重置密码**
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN",
    "newPassword": "newPassword123"
  }'
```

6. **使用新密码登录**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "newPassword123"
  }'
```

## 数据库验证

### 检查用户表
```sql
SELECT 
  id, 
  username, 
  email, 
  "resetPasswordToken", 
  "resetPasswordExpires"
FROM users 
WHERE email = 'test@example.com';
```

**令牌生成后**：
- `resetPasswordToken` 应该是一个 64 字符的十六进制字符串
- `resetPasswordExpires` 应该是当前时间 + 1 小时

**密码重置后**：
- `resetPasswordToken` 应该为 NULL
- `resetPasswordExpires` 应该为 NULL

## 安全测试

### 1. 暴力破解保护
- 测试短时间内多次请求密码重置
- 验证是否有速率限制（如果实现）

### 2. 令牌安全性
- 验证令牌是否足够随机（至少 32 字节）
- 验证数据库存储的是哈希值，不是原始令牌

### 3. 时间攻击保护
- 验证不同邮箱（存在/不存在）的响应时间是否一致

### 4. 邮件内容安全
- 检查邮件是否包含敏感信息（除了重置链接）
- 验证链接是否使用 HTTPS（生产环境）

## 常见问题

### 问题 1：邮件发送失败
**原因**：
- SMTP 配置不正确
- 邮箱密码错误
- 邮箱未开启 SMTP 服务

**解决方案**：
- 检查 `.env` 配置
- 使用 Ethereal Email 测试
- 查看服务器日志

### 问题 2：令牌验证失败
**原因**：
- 令牌已过期
- 令牌被修改
- URL 编码问题

**解决方案**：
- 检查令牌有效期
- 确保令牌完整传输
- 使用 URL 编码

### 问题 3：数据库字段不存在
**原因**：
- 迁移未运行
- 同步未开启

**解决方案**：
- 手动执行 SQL 创建字段
- 或在开发环境开启 `synchronize: true`

## 测试清单

- [ ] 场景 1：请求密码重置（成功）
- [ ] 场景 2：请求密码重置（邮箱不存在）
- [ ] 场景 3：验证重置令牌（有效）
- [ ] 场景 4：验证重置令牌（无效或过期）
- [ ] 场景 5：重置密码（成功）
- [ ] 场景 6：重置密码（密码格式不合法）
- [ ] 场景 7：重复使用重置令牌
- [ ] 场景 8：令牌过期
- [ ] 完整流程测试
- [ ] 数据库验证
- [ ] 安全测试

## 自动化测试（待实现）

未来可以使用 Jest 编写自动化测试：

```typescript
describe('Password Reset', () => {
  it('should send reset email for valid email', async () => {
    // 测试代码
  });
  
  it('should reset password with valid token', async () => {
    // 测试代码
  });
  
  it('should reject expired token', async () => {
    // 测试代码
  });
});
```

