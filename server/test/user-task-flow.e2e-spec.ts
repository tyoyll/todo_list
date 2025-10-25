import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

/**
 * 用户注册到任务创建的完整流程集成测试
 * 测试场景：
 * 1. 用户注册
 * 2. 用户登录
 * 3. 创建任务
 * 4. 查询任务列表
 * 5. 更新任务
 * 6. 添加任务笔记
 * 7. 完成任务
 * 8. 删除任务
 */
describe('User-Task Complete Flow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let taskId: string;

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
  });

  afterAll(async () => {
    // 清理测试数据
    const connection = getConnection();
    await connection.query('DELETE FROM task_notes WHERE 1=1');
    await connection.query('DELETE FROM tasks WHERE 1=1');
    await connection.query('DELETE FROM user_settings WHERE 1=1');
    await connection.query('DELETE FROM users WHERE email LIKE \'%test-e2e%\'');
    await app.close();
  });

  describe('1. 用户注册流程', () => {
    it('应该成功注册新用户', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser-e2e',
          email: 'test-e2e@example.com',
          password: 'Test123456!',
          nickname: 'Test User E2E',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe('test-e2e@example.com');
          userId = res.body.data.id;
        });
    });

    it('应该拒绝重复的邮箱', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser2-e2e',
          email: 'test-e2e@example.com',
          password: 'Test123456!',
          nickname: 'Test User 2',
        })
        .expect(400);
    });

    it('应该拒绝无效的邮箱格式', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser3-e2e',
          email: 'invalid-email',
          password: 'Test123456!',
          nickname: 'Test User 3',
        })
        .expect(400);
    });
  });

  describe('2. 用户登录流程', () => {
    it('应该成功登录并返回 token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'test-e2e@example.com',
          password: 'Test123456!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('accessToken');
          expect(res.body.data).toHaveProperty('refreshToken');
          expect(res.body.data.user.email).toBe('test-e2e@example.com');
          accessToken = res.body.data.accessToken;
        });
    });

    it('应该拒绝错误的密码', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'test-e2e@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('应该拒绝不存在的用户', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'nonexistent@example.com',
          password: 'Test123456!',
        })
        .expect(401);
    });
  });

  describe('3. 任务创建流程', () => {
    it('应该成功创建任务', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'E2E 测试任务',
          description: '这是一个集成测试任务',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: 120,
          tags: ['测试', 'E2E'],
          category: '开发',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.title).toBe('E2E 测试任务');
          expect(res.body.data.status).toBe('TODO');
          taskId = res.body.data.id;
        });
    });

    it('应该拒绝未认证的请求', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: '未授权任务',
          description: '这应该失败',
          priority: 'LOW',
        })
        .expect(401);
    });

    it('应该拒绝缺少必填字段的请求', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          description: '缺少标题',
          priority: 'LOW',
        })
        .expect(400);
    });
  });

  describe('4. 任务查询流程', () => {
    it('应该成功获取任务列表', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data.tasks)).toBe(true);
          expect(res.body.data.tasks.length).toBeGreaterThan(0);
        });
    });

    it('应该支持按状态筛选', () => {
      return request(app.getHttpServer())
        .get('/tasks?status=TODO')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          const tasks = res.body.data.tasks;
          tasks.forEach((task) => {
            expect(task.status).toBe('TODO');
          });
        });
    });

    it('应该支持搜索功能', () => {
      return request(app.getHttpServer())
        .get('/tasks?search=E2E')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.tasks.length).toBeGreaterThan(0);
        });
    });

    it('应该成功获取单个任务详情', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.id).toBe(taskId);
          expect(res.body.data.title).toBe('E2E 测试任务');
        });
    });
  });

  describe('5. 任务更新流程', () => {
    it('应该成功更新任务', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'E2E 测试任务 (已更新)',
          description: '更新后的描述',
          priority: 'MEDIUM',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('E2E 测试任务 (已更新)');
          expect(res.body.data.priority).toBe('MEDIUM');
        });
    });

    it('应该拒绝更新他人的任务', async () => {
      // 创建另一个用户
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser-other-e2e',
          email: 'test-other-e2e@example.com',
          password: 'Test123456!',
          nickname: 'Other User',
        });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          usernameOrEmail: 'test-other-e2e@example.com',
          password: 'Test123456!',
        });

      const otherToken = loginRes.body.data.accessToken;

      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          title: '尝试修改他人任务',
        })
        .expect(403);
    });
  });

  describe('6. 任务笔记功能', () => {
    it('应该成功添加任务笔记', () => {
      return request(app.getHttpServer())
        .post(`/tasks/${taskId}/notes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: '这是一条测试笔记',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.content).toBe('这是一条测试笔记');
        });
    });

    it('应该成功获取任务笔记列表', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}/notes`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('7. 任务状态转换', () => {
    it('应该成功将任务状态改为进行中', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'IN_PROGRESS',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('IN_PROGRESS');
        });
    });

    it('应该成功将任务标记为完成', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          status: 'COMPLETED',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('COMPLETED');
          expect(res.body.data.completedAt).toBeTruthy();
        });
    });
  });

  describe('8. 任务删除流程', () => {
    it('应该成功删除任务', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('已删除的任务不应出现在列表中', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          const tasks = res.body.data.tasks;
          const deletedTask = tasks.find((task) => task.id === taskId);
          expect(deletedTask).toBeUndefined();
        });
    });
  });
});

