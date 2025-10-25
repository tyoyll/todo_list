import { encrypt, decrypt, generateToken, hash, hmacSign, hmacVerify } from './encryption.util';

describe('Encryption Utilities', () => {
  describe('encrypt and decrypt', () => {
    it('应该能加密和解密文本', () => {
      const plainText = 'Hello, World!';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('应该为相同文本生成不同的加密结果', () => {
      const plainText = 'test message';
      const encrypted1 = encrypt(plainText);
      const encrypted2 = encrypt(plainText);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('应该能处理特殊字符', () => {
      const plainText = '中文测试 !@#$%^&*()';
      const encrypted = encrypt(plainText);
      const decrypted = decrypt(encrypted);
      
      expect(decrypted).toBe(plainText);
    });

    it('解密无效数据应抛出错误', () => {
      expect(() => decrypt('invalid_encrypted_data')).toThrow();
    });
  });

  describe('generateToken', () => {
    it('应该生成指定长度的token', () => {
      const token = generateToken(32);
      expect(token).toHaveLength(64); // hex编码，长度是字节数的2倍
    });

    it('应该生成不同的token', () => {
      const token1 = generateToken();
      const token2 = generateToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('hash', () => {
    it('应该对数据进行哈希', () => {
      const data = 'test data';
      const hashed = hash(data);
      
      expect(hashed).toBeTruthy();
      expect(hashed).toHaveLength(64); // SHA-256的hex长度
    });

    it('相同数据应生成相同哈希', () => {
      const data = 'test data';
      const hash1 = hash(data);
      const hash2 = hash(data);
      
      expect(hash1).toBe(hash2);
    });

    it('不同数据应生成不同哈希', () => {
      const hash1 = hash('data1');
      const hash2 = hash('data2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('HMAC签名和验证', () => {
    const secret = 'my_secret_key';

    it('应该能签名和验证数据', () => {
      const data = 'important data';
      const signature = hmacSign(data, secret);
      const isValid = hmacVerify(data, signature, secret);
      
      expect(isValid).toBe(true);
    });

    it('错误的签名应验证失败', () => {
      const data = 'important data';
      const signature = hmacSign(data, secret);
      const isValid = hmacVerify(data, 'wrong_signature', secret);
      
      expect(isValid).toBe(false);
    });

    it('修改数据应验证失败', () => {
      const data = 'important data';
      const signature = hmacSign(data, secret);
      const isValid = hmacVerify('modified data', signature, secret);
      
      expect(isValid).toBe(false);
    });

    it('错误的密钥应验证失败', () => {
      const data = 'important data';
      const signature = hmacSign(data, secret);
      const isValid = hmacVerify(data, signature, 'wrong_secret');
      
      expect(isValid).toBe(false);
    });
  });
});

