import * as nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config';

/**
 * 创建邮件传输器
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: mailConfig.auth,
  });
};

/**
 * 发送密码重置邮件
 * @param to 收件人邮箱
 * @param resetToken 重置令牌
 * @param username 用户名
 */
export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  username: string,
): Promise<void> => {
  const transporter = createTransporter();
  
  // 生成重置链接
  const resetUrl = `${mailConfig.appUrl}/reset-password?token=${resetToken}`;
  
  // 邮件HTML内容
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1890ff;
          margin: 0;
        }
        .content {
          background: white;
          padding: 20px;
          border-radius: 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #1890ff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #888;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 10px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Todo List</h1>
        </div>
        <div class="content">
          <h2>重置密码请求</h2>
          <p>你好，${username}！</p>
          <p>我们收到了你的密码重置请求。点击下面的按钮来重置你的密码：</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">重置密码</a>
          </p>
          <p>或者复制下面的链接到浏览器中打开：</p>
          <p style="word-break: break-all; color: #1890ff;">${resetUrl}</p>
          <div class="warning">
            <strong>重要提示：</strong>
            <ul>
              <li>此链接将在 1 小时后过期</li>
              <li>如果你没有请求重置密码，请忽略此邮件</li>
              <li>请勿将此链接分享给他人</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>此邮件由系统自动发送，请勿直接回复</p>
          <p>&copy; ${new Date().getFullYear()} Todo List. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // 纯文本版本（用于不支持HTML的邮件客户端）
  const text = `
你好，${username}！

我们收到了你的密码重置请求。请访问以下链接来重置你的密码：

${resetUrl}

此链接将在 1 小时后过期。

如果你没有请求重置密码，请忽略此邮件。

---
Todo List 团队
  `;
  
  // 发送邮件
  try {
    await transporter.sendMail({
      from: `"${mailConfig.from.name}" <${mailConfig.from.address}>`,
      to,
      subject: '重置密码 - Todo List',
      text,
      html,
    });
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw new Error('邮件发送失败，请稍后重试');
  }
};

/**
 * 发送密码重置成功通知邮件
 * @param to 收件人邮箱
 * @param username 用户名
 */
export const sendPasswordResetSuccessEmail = async (
  to: string,
  username: string,
): Promise<void> => {
  const transporter = createTransporter();
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #52c41a;
          margin: 0;
        }
        .content {
          background: white;
          padding: 20px;
          border-radius: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #888;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 10px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ 密码已重置</h1>
        </div>
        <div class="content">
          <p>你好，${username}！</p>
          <p>你的密码已成功重置。现在你可以使用新密码登录了。</p>
          <div class="warning">
            <strong>安全提示：</strong>
            <p>如果这不是你本人的操作，请立即联系我们的支持团队。</p>
          </div>
        </div>
        <div class="footer">
          <p>此邮件由系统自动发送，请勿直接回复</p>
          <p>&copy; ${new Date().getFullYear()} Todo List. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
你好，${username}！

你的密码已成功重置。现在你可以使用新密码登录了。

如果这不是你本人的操作，请立即联系我们的支持团队。

---
Todo List 团队
  `;
  
  try {
    await transporter.sendMail({
      from: `"${mailConfig.from.name}" <${mailConfig.from.address}>`,
      to,
      subject: '密码重置成功 - Todo List',
      text,
      html,
    });
  } catch (error) {
    console.error('邮件发送失败:', error);
    // 这里不抛出错误，因为密码已经重置成功，邮件发送失败不应影响主流程
  }
};

