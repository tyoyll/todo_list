import { test, expect } from '@playwright/test';

/**
 * 用户认证流程E2E测试
 * 测试场景：
 * 1. 用户注册
 * 2. 用户登录
 * 3. 登出
 * 4. 密码重置
 */
test.describe('用户认证流程', () => {
  const testEmail = `e2e-test-${Date.now()}@example.com`;
  const testUsername = `e2euser${Date.now()}`;
  const testPassword = 'Test123456!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该成功完成用户注册流程', async ({ page }) => {
    // 导航到注册页面
    await page.click('text=注册');
    await expect(page).toHaveURL(/.*register/);

    // 填写注册表单
    await page.fill('input[name="username"]', testUsername);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);

    // 提交表单
    await page.click('button[type="submit"]');

    // 验证注册成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 应该重定向到登录页面
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test('应该成功完成用户登录流程', async ({ page }) => {
    // 导航到登录页面
    await page.goto('/login');

    // 填写登录表单
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', testPassword);

    // 提交表单
    await page.click('button[type="submit"]');

    // 验证登录成功 - 应该重定向到仪表板
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });

    // 验证用户信息显示
    await expect(page.locator('.user-info')).toBeVisible();
  });

  test('应该拒绝错误的登录凭证', async ({ page }) => {
    await page.goto('/login');

    // 使用错误的密码
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', 'WrongPassword123!');

    await page.click('button[type="submit"]');

    // 应该显示错误消息
    await expect(page.locator('.ant-message-error')).toBeVisible({ timeout: 5000 });

    // 应该停留在登录页面
    await expect(page).toHaveURL(/.*login/);
  });

  test('应该成功登出', async ({ page }) => {
    // 先登录
    await page.goto('/login');
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });

    // 点击用户菜单
    await page.click('.user-menu');

    // 点击登出
    await page.click('text=退出登录');

    // 应该重定向到登录页面
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test('表单验证应该正常工作', async ({ page }) => {
    await page.goto('/register');

    // 提交空表单
    await page.click('button[type="submit"]');

    // 应该显示验证错误
    await expect(page.locator('.ant-form-item-explain-error')).toHaveCount(4);

    // 填写无效邮箱
    await page.fill('input[name="email"]', 'invalid-email');
    await page.blur('input[name="email"]');

    // 应该显示邮箱格式错误
    await expect(page.locator('text=请输入有效的邮箱地址')).toBeVisible();

    // 密码不匹配
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    await page.blur('input[name="confirmPassword"]');

    // 应该显示密码不匹配错误
    await expect(page.locator('text=两次输入的密码不一致')).toBeVisible();
  });
});

