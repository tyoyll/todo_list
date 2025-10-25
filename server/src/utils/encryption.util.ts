import * as crypto from 'crypto';

/**
 * 数据加密工具类
 * 用于加密敏感数据
 */

// 加密算法
const ALGORITHM = 'aes-256-gcm';
// 加密密钥（应从环境变量读取）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
// IV长度
const IV_LENGTH = 16;
// Auth Tag长度
const AUTH_TAG_LENGTH = 16;

/**
 * 加密数据
 * @param text 要加密的文本
 * @returns 加密后的文本（base64编码）
 */
export function encrypt(text: string): string {
  try {
    // 生成随机IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // 创建加密器
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY as string, 'hex'),
      iv,
    );
    
    // 加密数据
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 获取auth tag
    const authTag = cipher.getAuthTag();
    
    // 组合 IV + Auth Tag + 加密数据
    const result = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);
    
    return result.toString('base64');
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('数据加密失败');
  }
}

/**
 * 解密数据
 * @param encryptedText 加密的文本（base64编码）
 * @returns 解密后的文本
 */
export function decrypt(encryptedText: string): string {
  try {
    // 解码base64
    const buffer = Buffer.from(encryptedText, 'base64');
    
    // 提取 IV、Auth Tag 和加密数据
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
    
    // 创建解密器
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY as string, 'hex'),
      iv,
    );
    
    // 设置auth tag
    decipher.setAuthTag(authTag);
    
    // 解密数据
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('数据解密失败');
  }
}

/**
 * 生成随机token
 * @param length token长度（字节）
 * @returns 随机token（hex编码）
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 哈希数据（用于敏感数据的单向加密）
 * @param data 要哈希的数据
 * @returns 哈希值（hex编码）
 */
export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * HMAC签名
 * @param data 要签名的数据
 * @param secret 密钥
 * @returns 签名（hex编码）
 */
export function hmacSign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * 验证HMAC签名
 * @param data 原始数据
 * @param signature 签名
 * @param secret 密钥
 * @returns 是否有效
 */
export function hmacVerify(
  data: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = hmacSign(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}

