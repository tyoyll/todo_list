import { validate } from 'class-validator';
import { IsStrongPassword, NoSQLInjection } from './strong-password.validator';

class TestPasswordDto {
  @IsStrongPassword()
  password: string;
}

class TestInputDto {
  @NoSQLInjection()
  input: string;
}

describe('Strong Password Validator', () => {
  it('应该接受强密码', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'Strong@Pass123';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('应该拒绝短密码', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'Short1!';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该拒绝没有大写字母的密码', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'lowercase123!';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该拒绝没有小写字母的密码', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'UPPERCASE123!';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该拒绝没有数字的密码', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'NoNumbers!@#';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该拒绝没有特殊字符的密码', async () => {
    const dto = new TestPasswordDto();
    dto.password = 'NoSpecial123';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('NoSQLInjection Validator', () => {
  it('应该接受正常输入', async () => {
    const dto = new TestInputDto();
    dto.input = 'normal input text';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('应该拒绝包含SELECT的输入', async () => {
    const dto = new TestInputDto();
    dto.input = 'SELECT * FROM users';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该拒绝包含DROP的输入', async () => {
    const dto = new TestInputDto();
    dto.input = 'DROP TABLE users';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该拒绝包含注释符号的输入', async () => {
    const dto = new TestInputDto();
    dto.input = "'; DROP TABLE users--";
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('应该接受非字符串输入', async () => {
    const dto = new TestInputDto();
    dto.input = 123 as any;
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});

