import { test, expect } from '@playwright/test';

/**
 * 时间管理和统计E2E测试
 * 测试场景：
 * 1. 使用番茄钟计时
 * 2. 查看工作记录
 * 3. 查看统计数据
 * 4. 导出报表
 */
test.describe('时间管理和统计功能', () => {
  const testEmail = 'time-test@example.com';
  const testPassword = 'Test123456!';

  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login');
    await page.fill('input[name="usernameOrEmail"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 5000 });
  });

  test('应该能够启动番茄钟', async ({ page }) => {
    // 导航到番茄钟页面
    await page.click('text=番茄钟');
    await expect(page).toHaveURL(/.*pomodoro/);

    // 选择一个任务（如果有）
    const hasTaskSelect = await page.locator('.task-select').isVisible();
    if (hasTaskSelect) {
      await page.click('.task-select');
      await page.click('.ant-select-item:first-child');
    }

    // 点击开始按钮
    await page.click('button:has-text("开始")');

    // 验证计时器开始运行
    await expect(page.locator('.timer-running')).toBeVisible({ timeout: 2000 });

    // 验证显示倒计时
    await expect(page.locator('.timer-display')).toContainText(/\d{2}:\d{2}/);

    // 验证暂停按钮可见
    await expect(page.locator('button:has-text("暂停")')).toBeVisible();
  });

  test('应该能够暂停和恢复番茄钟', async ({ page }) => {
    await page.goto('/pomodoro');

    // 启动番茄钟
    await page.click('button:has-text("开始")');
    await expect(page.locator('.timer-running')).toBeVisible();

    // 暂停
    await page.click('button:has-text("暂停")');

    // 验证暂停状态
    await expect(page.locator('.timer-paused')).toBeVisible();
    await expect(page.locator('button:has-text("继续")')).toBeVisible();

    // 恢复
    await page.click('button:has-text("继续")');

    // 验证恢复运行
    await expect(page.locator('.timer-running')).toBeVisible();
  });

  test('应该能够停止番茄钟', async ({ page }) => {
    await page.goto('/pomodoro');

    // 启动番茄钟
    await page.click('button:has-text("开始")');

    // 等待一秒
    await page.waitForTimeout(1000);

    // 停止
    await page.click('button:has-text("停止")');

    // 确认停止
    if (await page.locator('.ant-modal-confirm').isVisible()) {
      await page.click('.ant-modal-confirm button:has-text("确定")');
    }

    // 验证回到初始状态
    await expect(page.locator('button:has-text("开始")')).toBeVisible();
  });

  test('应该能够查看今日番茄钟统计', async ({ page }) => {
    await page.goto('/pomodoro');

    // 验证统计信息显示
    await expect(page.locator('.pomodoro-stats')).toBeVisible();

    // 验证显示完成数量
    await expect(page.locator('.completed-count')).toBeVisible();

    // 验证显示目标进度
    await expect(page.locator('.daily-goal')).toBeVisible();
  });

  test('应该能够查看工作时间记录', async ({ page }) => {
    // 导航到时间记录页面
    await page.click('text=时间记录');
    await expect(page).toHaveURL(/.*time-records/);

    // 验证记录列表显示
    await expect(page.locator('.time-records-list')).toBeVisible();

    // 验证显示总工作时长
    await expect(page.locator('.total-duration')).toBeVisible();

    // 验证可以按日期筛选
    await expect(page.locator('.date-picker')).toBeVisible();
  });

  test('应该能够按日期筛选时间记录', async ({ page }) => {
    await page.goto('/time-records');

    // 选择日期
    await page.click('.date-picker');

    // 选择今天
    await page.click('.ant-picker-cell-today');

    // 等待数据加载
    await page.waitForTimeout(500);

    // 验证显示筛选后的记录
    await expect(page.locator('.time-records-list')).toBeVisible();
  });

  test('应该能够查看统计仪表板', async ({ page }) => {
    // 导航到统计页面
    await page.click('text=数据统计');
    await expect(page).toHaveURL(/.*statistics/);

    // 验证关键指标显示
    await expect(page.locator('.total-tasks-stat')).toBeVisible();
    await expect(page.locator('.completed-tasks-stat')).toBeVisible();
    await expect(page.locator('.completion-rate-stat')).toBeVisible();

    // 验证图表显示
    await expect(page.locator('.chart-container')).toBeVisible();
  });

  test('应该能够查看不同时间范围的统计', async ({ page }) => {
    await page.goto('/statistics');

    // 切换到本周
    await page.click('button:has-text("本周")');
    await page.waitForTimeout(500);
    await expect(page.locator('.weekly-stats')).toBeVisible();

    // 切换到本月
    await page.click('button:has-text("本月")');
    await page.waitForTimeout(500);
    await expect(page.locator('.monthly-stats')).toBeVisible();

    // 切换到本年
    await page.click('button:has-text("本年")');
    await page.waitForTimeout(500);
    await expect(page.locator('.yearly-stats')).toBeVisible();
  });

  test('应该能够查看任务完成趋势图', async ({ page }) => {
    await page.goto('/statistics');

    // 滚动到趋势图区域
    await page.locator('.trend-chart').scrollIntoViewIfNeeded();

    // 验证趋势图显示
    await expect(page.locator('.trend-chart')).toBeVisible();

    // 验证图表有数据点
    await expect(page.locator('.recharts-line, .recharts-bar')).toBeVisible();
  });

  test('应该能够查看任务分类统计', async ({ page }) => {
    await page.goto('/statistics');

    // 滚动到分类统计区域
    await page.locator('.category-stats').scrollIntoViewIfNeeded();

    // 验证分类统计图显示
    await expect(page.locator('.category-chart')).toBeVisible();

    // 验证饼图或柱状图显示
    await expect(page.locator('.recharts-pie, .recharts-bar')).toBeVisible();
  });

  test('应该能够查看优先级分布', async ({ page }) => {
    await page.goto('/statistics');

    // 滚动到优先级统计区域
    await page.locator('.priority-stats').scrollIntoViewIfNeeded();

    // 验证优先级统计显示
    await expect(page.locator('.priority-chart')).toBeVisible();
  });

  test('应该能够导出报表', async ({ page }) => {
    await page.goto('/statistics/reports');

    // 选择日期范围
    await page.click('.date-range-picker');
    await page.click('.ant-picker-preset:has-text("最近30天")');

    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');

    // 点击导出Excel
    await page.click('button:has-text("导出Excel")');

    // 等待下载
    const download = await downloadPromise;

    // 验证文件名
    expect(download.suggestedFilename()).toMatch(/report.*\.xlsx/);
  });

  test('应该能够导出PDF报表', async ({ page }) => {
    await page.goto('/statistics/reports');

    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');

    // 点击导出PDF
    await page.click('button:has-text("导出PDF")');

    // 等待下载
    const download = await downloadPromise;

    // 验证文件名
    expect(download.suggestedFilename()).toMatch(/report.*\.pdf/);
  });

  test('应该能够查看工作效率分析', async ({ page }) => {
    await page.goto('/statistics');

    // 滚动到效率分析区域
    await page.locator('.efficiency-analysis').scrollIntoViewIfNeeded();

    // 验证效率指标显示
    await expect(page.locator('.avg-completion-time')).toBeVisible();
    await expect(page.locator('.efficiency-score')).toBeVisible();

    // 验证效率趋势图显示
    await expect(page.locator('.efficiency-trend-chart')).toBeVisible();
  });
});

