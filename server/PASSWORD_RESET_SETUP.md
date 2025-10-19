# 密码重置功能配置指南

## 概述
密码重置功能已经实现，本文档说明如何配置和使用该功能。

## 环境变量配置

在 `.env` 文件中添加以下邮件配置：

```env
# 邮件配置
# SMTP 服务器设置
MAIL_HOST=smtp.gmail.com          # SMTP 服务器地址
MAIL_PORT=587                      # SMTP 端口（587 for TLS, 465 for SSL）
MAIL_SECURE=false                  # true for 465, false for 587
MAIL_USER=your-email@gmail.com     # 发件人邮箱
MAIL_PASSWORD=your-app-password    # 邮箱密码或应用专用密码
MAIL_FROM_NAME=Todo List           # 发件人名称
MAIL_FROM_ADDRESS=your-email@gmail.com  # 发件人邮箱地址

# 前端应用 URL（用于生成密码重置链接）
APP_URL=http://localhost:5173
```

## Gmail 配置示例

如果使用 Gmail，需要：

1. 开启两步验证
2. 生成应用专用密码：
   - 访问 https://myaccount.google.com/apppasswords
   - 选择"邮件"和"Windows 计算机"
   - 生成密码并复制到 `MAIL_PASSWORD`

配置示例：
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=yourname@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
```

## 其他邮件服务商配置

### Outlook/Hotmail
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_SECURE=false
```

### QQ 邮箱
```env
MAIL_HOST=smtp.qq.com
MAIL_PORT=587
MAIL_SECURE=false
# 需要在 QQ 邮箱设置中开启 SMTP 服务并获取授权码
```

### 163 邮箱
```env
MAIL_HOST=smtp.163.com
MAIL_PORT=465
MAIL_SECURE=true
# 需要在 163 邮箱设置中开启 SMTP 服务并获取授权码
```

## 数据库迁移

添加了以下字段到 `users` 表：
- `resetPasswordToken`: 存储密码重置令牌的哈希值
- `resetPasswordExpires`: 令牌过期时间

### 自动同步方式
如果在 `database.config.ts` 中设置了 `synchronize: true`（仅开发环境），字段会自动创建。

### 手动迁移方式
或者手动执行 SQL：
```sql
ALTER TABLE users ADD COLUMN "resetPasswordToken" varchar NULL;
ALTER TABLE users ADD COLUMN "resetPasswordExpires" timestamp NULL;
```

## API 端点

### 1. 请求密码重置
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

响应：
```json
{
  "message": "如果该邮箱已注册，你将收到密码重置邮件"
}
```

### 2. 验证重置令牌
```http
GET /auth/verify-reset-token?token=your-token-here
```

响应：
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

### 3. 重置密码
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "your-token-here",
  "newPassword": "newPassword123"
}
```

响应：
```json
{
  "message": "密码重置成功，请使用新密码登录"
}
```

## 安全特性

1. **令牌哈希存储**：数据库中存储的是令牌的 SHA-256 哈希值，不是原始令牌
2. **时间限制**：重置令牌 1 小时后自动过期
3. **一次性使用**：令牌使用后立即失效
4. **用户信息保护**：即使邮箱不存在，也返回相同的成功消息，避免泄露用户信息
5. **密码强度验证**：新密码必须至少 6 个字符，包含字母和数字

## 邮件模板

系统会发送两种邮件：
1. **密码重置邮件**：包含重置链接和安全提示
2. **密码重置成功通知**：确认密码已更改

邮件模板位于 `src/utils/mail.util.ts`，可以根据需要自定义。

## 测试

### 测试邮件发送
可以使用 Mailtrap 或 Ethereal Email 进行测试：

```env
# Ethereal Email（临时邮箱，用于开发测试）
MAIL_HOST=smtp.ethereal.email
MAIL_PORT=587
MAIL_USER=your-ethereal-username
MAIL_PASSWORD=your-ethereal-password
```

访问 https://ethereal.email/ 创建临时测试邮箱。

## 故障排查

### 邮件发送失败
- 检查 SMTP 配置是否正确
- 确认邮箱密码/应用密码正确
- 检查防火墙是否阻止 SMTP 端口
- 查看服务器日志获取详细错误信息

### 令牌无效
- 检查令牌是否过期（1 小时有效期）
- 确认令牌未被使用过
- 检查 URL 中的令牌是否完整

## 生产环境注意事项

1. **使用专业邮件服务**：建议使用 SendGrid, Amazon SES, Mailgun 等专业邮件服务
2. **配置 SPF/DKIM**：确保邮件不被标记为垃圾邮件
3. **监控发送量**：设置邮件发送限制，防止滥用
4. **日志记录**：记录所有密码重置请求，用于安全审计
5. **关闭同步**：生产环境必须关闭 `synchronize`，使用迁移管理数据库

## 开发计划更新

✅ 2.1.3 密码重置功能已完成：
- [x] 创建密码重置请求端点
- [x] 实现邮件发送功能（使用 NodeMailer）
- [x] 创建密码重置验证端点
- [x] 实现 token 过期检查
- [ ] 编写单元测试（待完成）

