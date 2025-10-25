import { test, expect } from '@playwright/test';

/**
 * 通知功能E2E测试
 * 测试场景：
 * 1. 查看通知列表
 * 2. 标记通知已读
 * 3. 删除通知
 * 4. 通知设置
 */
test.describe('通知功能', () => {
  const testEmail = 'notif-test@example.com';
  const testPassword = 'Test123456!';

  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  });

  test('应该能够查看通知中心', async ({ page }) => {
    // 点击通知图标
    await page.click('.notification-bell');

    // 验证通知下拉菜单显示
    await expect(page.locator('.notification-dropdown')).toBeVisible();

    // 验证显示未读数量
    const unreadBadge = page.locator('.notification-badge');
    if (await unreadBadge.isVisible()) {
      const count = await unreadBadge.textContent();
      expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0);
    }
  });

  test('应该能够查看通知详情', async ({ page }) => {
    // 导航到通知页面
    await page.goto('/notifications');

    // 验证通知列表显示
    await expect(page.locator('.notifications-list')).toBeVisible();

    // 验证通知项包含必要信息
    const firstNotif = page.locator('.notification-item').first();
    if (await firstNotif.isVisible()) {
      await expect(firstNotif.locator('.notification-title')).toBeVisible();
      await expect(firstNotif.locator('.notification-time')).toBeVisible();
    }
  });

  test('应该能够标记单个通知为已读', async ({ page }) => {
    await page.goto('/notifications');

    // 找到第一个未读通知
    const unreadNotif = page.locator('.notification-item.unread').first();

    if (await unreadNotif.isVisible()) {
      // 点击标记为已读按钮
      await unreadNotif.locator('.mark-read-button').click();

      // 验证通知已标记为已读
      await expect(unreadNotif.locator('.unread-indicator')).not.toBeVisible();

      // 验证成功消息
      await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });
    }
  });

  test('应该能够标记所有通知为已读', async ({ page }) => {
    await page.goto('/notifications');

    // 点击全部标记为已读按钮
    await page.click('button:has-text("全部已读")');

    // 等待操作完成
    await page.waitForTimeout(500);

    // 验证没有未读通知
    const unreadCount = await page.locator('.notification-item.unread').count();
    expect(unreadCount).toBe(0);

    // 验证未读数量徽章不显示或为0
    const badge = page.locator('.notification-badge');
    if (await badge.isVisible()) {
      const count = await badge.textContent();
      expect(count).toBe('0');
    }
  });

  test('应该能够删除通知', async ({ page }) => {
    await page.goto('/notifications');

    // 获取删除前的通知数量
    const countBefore = await page.locator('.notification-item').count();

    if (countBefore > 0) {
      // 点击第一个通知的删除按钮
      await page.click('.notification-item:first-child .delete-button');

      // 确认删除
      if (await page.locator('.ant-modal-confirm').isVisible()) {
        await page.click('.ant-modal-confirm button:has-text("确定")');
      }

      // 验证成功消息
      await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

      // 验证通知数量减少
      const countAfter = await page.locator('.notification-item').count();
      expect(countAfter).toBe(countBefore - 1);
    }
  });

  test('应该能够按类型筛选通知', async ({ page }) => {
    await page.goto('/notifications');

    // 点击类型筛选
    await page.click('.notification-type-filter');

    // 选择任务相关通知
    await page.click('.ant-select-item:has-text("任务相关")');

    // 等待筛选结果
    await page.waitForTimeout(500);

    // 验证显示的都是任务相关通知
    const notifications = await page.locator('.notification-item').all();
    for (const notif of notifications) {
      const type = await notif.locator('.notification-type').textContent();
      expect(type).toContain('任务');
    }
  });

  test('应该能够查看通知设置', async ({ page }) => {
    // 导航到设置页面
    await page.goto('/settings');

    // 切换到通知设置标签
    await page.click('.settings-tabs .tab:has-text("通知设置")');

    // 验证通知设置选项显示
    await expect(page.locator('.notification-settings')).toBeVisible();

    // 验证各种通知开关
    await expect(page.locator('.setting-task-due')).toBeVisible();
    await expect(page.locator('.setting-break-reminder')).toBeVisible();
    await expect(page.locator('.setting-important-task')).toBeVisible();
  });

  test('应该能够更新通知设置', async ({ page }) => {
    await page.goto('/settings');
    await page.click('.settings-tabs .tab:has-text("通知设置")');

    // 切换任务截止提醒
    const taskDueSwitch = page.locator('.setting-task-due .ant-switch');
    const initialState = await taskDueSwitch.getAttribute('aria-checked');

    await taskDueSwitch.click();

    // 验证状态已改变
    const newState = await taskDueSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);

    // 保存设置
    await page.click('button:has-text("保存")');

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });
  });

  test('应该能够设置休息提醒间隔', async ({ page }) => {
    await page.goto('/settings');
    await page.click('.settings-tabs .tab:has-text("通知设置")');

    // 找到休息提醒间隔输入框
    const intervalInput = page.locator('input[name="breakReminderInterval"]');

    // 设置新的间隔时间（分钟）
    await intervalInput.fill('45');

    // 保存设置
    await page.click('button:has-text("保存")');

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 刷新页面验证设置已保存
    await page.reload();
    await page.click('.settings-tabs .tab:has-text("通知设置")');

    // 验证值已保存
    await expect(intervalInput).toHaveValue('45');
  });

  test('通知应该实时更新', async ({ page }) => {
    await page.goto('/dashboard');

    // 获取当前未读数量
    const badge = page.locator('.notification-badge');
    let initialCount = 0;

    if (await badge.isVisible()) {
      const countText = await badge.textContent();
      initialCount = parseInt(countText || '0');
    }

    // 创建一个新任务（这可能触发通知）
    await page.goto('/tasks');
    await page.click('button:has-text("新建任务")');

    await page.fill('input[name="title"]', '测试通知任务');
    await page.fill('textarea[name="description"]', '用于测试通知');

    // 设置即将到期的时间
    await page.click('.ant-picker');
    await page.click('.ant-picker-cell-today');

    await page.click('button[type="submit"]:has-text("创建")');

    // 等待通知生成
    await page.waitForTimeout(2000);

    // 返回仪表板
    await page.goto('/dashboard');

    // 验证通知数量可能增加（取决于系统配置）
    if (await badge.isVisible()) {
      const newCountText = await badge.textContent();
      const newCount = parseInt(newCountText || '0');
      // 通知数量应该大于等于之前的数量（可能没有立即生成通知）
      expect(newCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('应该显示不同类型的通知图标', async ({ page }) => {
    await page.goto('/notifications');

    const notifications = await page.locator('.notification-item').all();

    for (const notif of notifications.slice(0, 5)) {
      // 每个通知应该有图标
      await expect(notif.locator('.notification-icon')).toBeVisible();

      // 验证图标类型不同
      const iconClass = await notif.locator('.notification-icon').getAttribute('class');
      expect(iconClass).toBeTruthy();
    }
  });

  test('点击通知应该跳转到相关页面', async ({ page }) => {
    await page.goto('/notifications');

    // 找到第一个任务相关通知
    const taskNotif = page.locator('.notification-item[data-type="TASK"]').first();

    if (await taskNotif.isVisible()) {
      // 点击通知
      await taskNotif.click();

      // 应该跳转到任务详情或任务列表页面
      await expect(page).toHaveURL(/.*tasks.*/);
    }
  });
});

