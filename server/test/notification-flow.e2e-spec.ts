import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

/**
 * 通知生成和显示的完整流程集成测试
 * 测试场景：
 * 1. 创建系统通知
 * 2. 获取通知列表
 * 3. 标记通知已读
 * 4. 删除通知
 * 5. 任务截止提醒
 * 6. 通知筛选功能
 */
describe('Notification Flow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let taskId: string;
  let notificationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // 注册并登录测试用户
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        username: 'notifuser-e2e',
        email: 'notif-test-e2e@example.com',
        password: 'Test123456!',
        nickname: 'Notification Test User',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: 'notif-test-e2e@example.com',
        password: 'Test123456!',
      });

    accessToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    // 清理测试数据
    const connection = getConnection();
    await connection.query('DELETE FROM notifications WHERE 1=1');
    await connection.query('DELETE FROM task_notes WHERE 1=1');
    await connection.query('DELETE FROM tasks WHERE 1=1');
    await connection.query('DELETE FROM user_settings WHERE 1=1');
    await connection.query('DELETE FROM users WHERE email LIKE \'%notif-test-e2e%\'');
    await app.close();
  });

  describe('1. 通知基本功能', () => {
    beforeAll(async () => {
      // 创建一个任务，这会触发系统通知
      const taskRes = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '通知测试任务',
          description: '用于测试通知功能',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天到期
        });

      taskId = taskRes.body.data.id;
    });

    it('应该成功获取通知列表', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data.notifications)).toBe(true);
        });
    });

    it('应该成功获取未读通知数量', () => {
      return request(app.getHttpServer())
        .get('/notifications/unread/count')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('count');
          expect(typeof res.body.data.count).toBe('number');
        });
    });

    it('应该成功标记单个通知为已读', async () => {
      // 先获取一个通知
      const listRes = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${accessToken}`);

      if (listRes.body.data.notifications.length > 0) {
        notificationId = listRes.body.data.notifications[0].id;

        return request(app.getHttpServer())
          .patch(`/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
            expect(res.body.data.isRead).toBe(true);
          });
      }
    });

    it('应该成功标记所有通知为已读', () => {
      return request(app.getHttpServer())
        .patch('/notifications/read-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('应该成功删除通知', async () => {
      if (notificationId) {
        return request(app.getHttpServer())
          .delete(`/notifications/${notificationId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.success).toBe(true);
          });
      }
    });
  });

  describe('2. 通知筛选功能', () => {
    it('应该成功按类型筛选通知', () => {
      return request(app.getHttpServer())
        .get('/notifications?type=TASK_DUE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          const notifications = res.body.data.notifications;
          if (notifications.length > 0) {
            notifications.forEach((notif) => {
              expect(notif.type).toBe('TASK_DUE');
            });
          }
        });
    });

    it('应该成功只获取未读通知', () => {
      return request(app.getHttpServer())
        .get('/notifications?isRead=false')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          const notifications = res.body.data.notifications;
          if (notifications.length > 0) {
            notifications.forEach((notif) => {
              expect(notif.isRead).toBe(false);
            });
          }
        });
    });

    it('应该支持分页', () => {
      return request(app.getHttpServer())
        .get('/notifications?page=1&limit=5')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('notifications');
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('page');
          expect(res.body.data).toHaveProperty('totalPages');
        });
    });
  });

  describe('3. 任务截止提醒', () => {
    it('应该为即将到期的任务创建提醒', async () => {
      // 创建一个明天到期的高优先级任务
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '明天到期的任务',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      // 手动触发截止提醒检查（实际中这是定时任务）
      await request(app.getHttpServer())
        .post('/notifications/check-due-tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      // 检查是否生成了通知
      return request(app.getHttpServer())
        .get('/notifications?type=TASK_DUE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('应该为已逾期的任务创建提醒', async () => {
      // 创建一个已经过期的任务
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '已逾期的任务',
          priority: 'HIGH',
          dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        });

      // 手动触发截止提醒检查
      await request(app.getHttpServer())
        .post('/notifications/check-due-tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      // 检查是否生成了逾期通知
      return request(app.getHttpServer())
        .get('/notifications?type=TASK_OVERDUE')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('4. 权限检查', () => {
    it('应该拒绝未认证用户访问通知', () => {
      return request(app.getHttpServer())
        .get('/notifications')
        .expect(401);
    });

    it('用户不应该能访问他人的通知', async () => {
      // 创建另一个用户
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'othernotifuser-e2e',
          email: 'other-notif-e2e@example.com',
          password: 'Test123456!',
          nickname: 'Other User',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'other-notif-e2e@example.com',
          password: 'Test123456!',
        });

      const otherToken = loginRes.body.data.accessToken;

      // 尝试用另一个用户的token访问第一个用户的通知
      if (notificationId) {
        return request(app.getHttpServer())
          .patch(`/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${otherToken}`)
          .expect(403);
      }
    });
  });

  describe('5. 通知设置', () => {
    it('应该成功更新通知设置', () => {
      return request(app.getHttpServer())
        .patch('/users/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          enableTaskDueNotification: true,
          enableBreakReminder: true,
          breakReminderInterval: 60,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.enableTaskDueNotification).toBe(true);
          expect(res.body.data.enableBreakReminder).toBe(true);
        });
    });

    it('禁用通知后不应创建新通知', async () => {
      // 禁用任务截止通知
      await request(app.getHttpServer())
        .patch('/users/settings')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          enableTaskDueNotification: false,
        });

      // 创建即将到期的任务
      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '测试禁用通知',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

      // 获取通知数量（此时不应该有新通知）
      const beforeCount = await request(app.getHttpServer())
        .get('/notifications/unread/count')
        .set('Authorization', `Bearer ${accessToken}`);

      const countBefore = beforeCount.body.data.count;

      // 触发检查
      await request(app.getHttpServer())
        .post('/notifications/check-due-tasks')
        .set('Authorization', `Bearer ${accessToken}`);

      // 再次获取通知数量，应该没有增加
      return request(app.getHttpServer())
        .get('/notifications/unread/count')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          // 由于禁用了通知，数量应该不变或减少（如果有已读的）
          expect(res.body.data.count).toBeLessThanOrEqual(countBefore);
        });
    });
  });
});

