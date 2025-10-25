import { test, expect } from '@playwright/test';

/**
 * 任务管理E2E测试
 * 测试场景：
 * 1. 创建任务
 * 2. 查看任务列表
 * 3. 编辑任务
 * 4. 筛选和搜索任务
 * 5. 完成任务
 * 6. 删除任务
 */
test.describe('任务管理流程', () => {
  const testEmail = 'task-test@example.com';
  const testPassword = 'Test123456!';
  let taskTitle = '';

  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 等待跳转到仪表板
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  });

  test('应该成功创建新任务', async ({ page }) => {
    taskTitle = `测试任务 ${Date.now()}`;

    // 导航到任务列表
    await page.click('text=任务管理');
    await expect(page).toHaveURL(/.*tasks/);

    // 点击创建任务按钮
    await page.click('button:has-text("新建任务")');

    // 填写任务表单
    await page.fill('input[name="title"]', taskTitle);
    await page.fill('textarea[name="description"]', '这是一个测试任务的描述');

    // 选择优先级
    await page.click('.ant-select:has-text("优先级")');
    await page.click('.ant-select-item:has-text("高")');

    // 选择分类
    await page.fill('input[name="category"]', '开发');

    // 添加标签
    await page.fill('input[name="tags"]', '测试');
    await page.press('input[name="tags"]', 'Enter');

    // 设置预计时间
    await page.fill('input[name="estimatedTime"]', '120');

    // 提交表单
    await page.click('button[type="submit"]:has-text("创建")');

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 验证任务出现在列表中
    await expect(page.locator(`text=${taskTitle}`)).toBeVisible();
  });

  test('应该能够查看任务详情', async ({ page }) => {
    // 导航到任务列表
    await page.goto('/tasks');

    // 点击第一个任务
    await page.click('.task-item:first-child');

    // 验证任务详情页面
    await expect(page).toHaveURL(/.*tasks\/[a-zA-Z0-9-]+/);

    // 验证详情页面元素
    await expect(page.locator('.task-title')).toBeVisible();
    await expect(page.locator('.task-description')).toBeVisible();
    await expect(page.locator('.task-priority')).toBeVisible();
    await expect(page.locator('.task-status')).toBeVisible();
  });

  test('应该能够编辑任务', async ({ page }) => {
    await page.goto('/tasks');

    // 点击第一个任务的编辑按钮
    await page.click('.task-item:first-child .edit-button');

    // 修改标题
    const newTitle = `已编辑的任务 ${Date.now()}`;
    await page.fill('input[name="title"]', newTitle);

    // 修改优先级
    await page.click('.ant-select:has-text("优先级")');
    await page.click('.ant-select-item:has-text("中")');

    // 提交更改
    await page.click('button[type="submit"]:has-text("保存")');

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 验证任务标题已更新
    await expect(page.locator(`text=${newTitle}`)).toBeVisible();
  });

  test('应该能够筛选任务', async ({ page }) => {
    await page.goto('/tasks');

    // 按状态筛选
    await page.click('.filter-status');
    await page.click('.ant-select-item:has-text("待完成")');

    // 等待列表更新
    await page.waitForTimeout(1000);

    // 验证所有显示的任务都是待完成状态
    const tasks = await page.locator('.task-item').all();
    for (const task of tasks) {
      await expect(task.locator('.status-badge:has-text("待完成")')).toBeVisible();
    }

    // 按优先级筛选
    await page.click('.filter-priority');
    await page.click('.ant-select-item:has-text("高")');

    // 等待列表更新
    await page.waitForTimeout(1000);

    // 验证所有显示的任务都是高优先级
    const highPriorityTasks = await page.locator('.task-item').all();
    for (const task of highPriorityTasks) {
      await expect(task.locator('.priority-badge:has-text("高")')).toBeVisible();
    }
  });

  test('应该能够搜索任务', async ({ page }) => {
    await page.goto('/tasks');

    // 在搜索框中输入关键词
    await page.fill('input[placeholder*="搜索"]', '测试');

    // 等待搜索结果
    await page.waitForTimeout(500);

    // 验证搜索结果中包含关键词
    const taskTitles = await page.locator('.task-title').allTextContents();
    expect(taskTitles.some(title => title.includes('测试'))).toBeTruthy();
  });

  test('应该能够添加任务笔记', async ({ page }) => {
    await page.goto('/tasks');

    // 点击第一个任务进入详情页
    await page.click('.task-item:first-child');

    // 滚动到笔记区域
    await page.locator('.task-notes-section').scrollIntoViewIfNeeded();

    // 添加笔记
    const noteContent = `测试笔记 ${Date.now()}`;
    await page.fill('textarea[placeholder*="笔记"]', noteContent);
    await page.click('button:has-text("添加笔记")');

    // 验证笔记已添加
    await expect(page.locator(`text=${noteContent}`)).toBeVisible({ timeout: 5000 });
  });

  test('应该能够完成任务', async ({ page }) => {
    await page.goto('/tasks');

    // 点击第一个任务的完成按钮
    await page.click('.task-item:first-child .complete-button');

    // 确认对话框
    if (await page.locator('.ant-modal-confirm').isVisible()) {
      await page.click('.ant-modal-confirm button:has-text("确定")');
    }

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 验证任务状态已更新为已完成
    await expect(
      page.locator('.task-item:first-child .status-badge:has-text("已完成")')
    ).toBeVisible();
  });

  test('应该能够删除任务', async ({ page }) => {
    await page.goto('/tasks');

    // 获取删除前的任务数量
    const taskCountBefore = await page.locator('.task-item').count();

    // 点击第一个任务的删除按钮
    await page.click('.task-item:first-child .delete-button');

    // 确认删除
    await page.click('.ant-modal-confirm button:has-text("确定")');

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 验证任务数量减少
    const taskCountAfter = await page.locator('.task-item').count();
    expect(taskCountAfter).toBe(taskCountBefore - 1);
  });

  test('任务列表分页应该正常工作', async ({ page }) => {
    await page.goto('/tasks');

    // 检查是否有分页组件
    const hasPagination = await page.locator('.ant-pagination').isVisible();

    if (hasPagination) {
      // 点击下一页
      await page.click('.ant-pagination-next');

      // 等待页面更新
      await page.waitForTimeout(500);

      // 验证URL包含页码参数
      expect(page.url()).toContain('page=2');

      // 验证任务列表已更新
      await expect(page.locator('.task-item').first()).toBeVisible();
    }
  });
});

