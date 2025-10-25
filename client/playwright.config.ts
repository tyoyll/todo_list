import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E测试配置
 * 参考: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* 测试超时时间 */
  timeout: 30 * 1000,
  /* 每个测试的expect超时时间 */
  expect: {
    timeout: 5000,
  },
  /* 失败后不重试 */
  fullyParallel: true,
  /* CI环境下如果有测试失败就停止 */
  forbidOnly: !!process.env.CI,
  /* 失败时重试次数 */
  retries: process.env.CI ? 2 : 0,
  /* 并发执行的worker数量 */
  workers: process.env.CI ? 1 : undefined,
  /* 测试报告生成器 */
  reporter: [
    ['html'],
    ['list'],
  ],
  /* 所有测试的共享配置 */
  use: {
    /* 测试的基础URL */
    baseURL: 'http://localhost:5173',
    /* 失败时收集追踪信息 */
    trace: 'on-first-retry',
    /* 截图设置 */
    screenshot: 'only-on-failure',
    /* 视频录制 */
    video: 'retain-on-failure',
  },

  /* 配置不同浏览器的测试项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* 移动端浏览器测试 */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* 在测试前启动开发服务器 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

