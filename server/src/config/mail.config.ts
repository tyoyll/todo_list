/**
 * 邮件配置
 * 用于发送密码重置邮件等
 */
export const mailConfig = {
  // SMTP 服务器配置
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
  
  // 认证信息
  auth: {
    user: process.env.MAIL_USER || '', // 发件人邮箱
    pass: process.env.MAIL_PASSWORD || '', // 邮箱密码或应用专用密码
  },
  
  // 发件人信息
  from: {
    name: process.env.MAIL_FROM_NAME || 'Todo List',
    address: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USER || '',
  },
  
  // 前端应用 URL（用于生成重置链接）
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  
  // 密码重置 token 有效期（毫秒）
  resetPasswordExpires: 3600000, // 1小时
};

