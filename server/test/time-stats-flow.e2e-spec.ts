import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

/**
 * 时间记录和统计的完整流程集成测试
 * 测试场景：
 * 1. 创建时间记录
 * 2. 开始番茄钟
 * 3. 完成番茄钟
 * 4. 查询时间统计
 * 5. 查询番茄钟统计
 * 6. 导出统计报表
 */
describe('Time-Management and Statistics Flow (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let taskId: string;
  let timeRecordId: string;
  let pomodoroRecordId: string;

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
        username: 'timeuser-e2e',
        email: 'time-test-e2e@example.com',
        password: 'Test123456!',
        nickname: 'Time Test User',
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: 'time-test-e2e@example.com',
        password: 'Test123456!',
      });

    accessToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;

    // 创建测试任务
    const taskRes = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: '时间测试任务',
        description: '用于测试时间记录的任务',
        priority: 'MEDIUM',
      });

    taskId = taskRes.body.data.id;
  });

  afterAll(async () => {
    // 清理测试数据
    const connection = getConnection();
    await connection.query('DELETE FROM pomodoro_records WHERE 1=1');
    await connection.query('DELETE FROM time_records WHERE 1=1');
    await connection.query('DELETE FROM task_notes WHERE 1=1');
    await connection.query('DELETE FROM tasks WHERE 1=1');
    await connection.query('DELETE FROM user_settings WHERE 1=1');
    await connection.query('DELETE FROM users WHERE email LIKE \'%time-test-e2e%\'');
    await app.close();
  });

  describe('1. 时间记录功能', () => {
    it('应该成功开始工作记录', () => {
      return request(app.getHttpServer())
        .post('/time-management/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          taskId: taskId,
          description: '开始工作',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.startTime).toBeTruthy();
          expect(res.body.data.endTime).toBeNull();
          timeRecordId = res.body.data.id;
        });
    });

    it('应该成功结束工作记录', async () => {
      // 等待1秒以确保有时间差
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return request(app.getHttpServer())
        .patch(`/time-management/${timeRecordId}/end`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.endTime).toBeTruthy();
          expect(res.body.data.duration).toBeGreaterThan(0);
        });
    });

    it('应该成功获取时间记录列表', () => {
      return request(app.getHttpServer())
        .get('/time-management/records')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('2. 番茄钟功能', () => {
    it('应该成功开始番茄钟', () => {
      return request(app.getHttpServer())
        .post('/time-management/pomodoro/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          taskId: taskId,
          duration: 25,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.status).toBe('IN_PROGRESS');
          expect(res.body.data.duration).toBe(25);
          pomodoroRecordId = res.body.data.id;
        });
    });

    it('应该成功完成番茄钟', async () => {
      // 等待一秒
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return request(app.getHttpServer())
        .patch(`/time-management/pomodoro/${pomodoroRecordId}/complete`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.status).toBe('COMPLETED');
          expect(res.body.data.completedAt).toBeTruthy();
        });
    });

    it('应该能开始休息', () => {
      return request(app.getHttpServer())
        .post('/time-management/pomodoro/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          duration: 5,
          isBreak: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.isBreak).toBe(true);
        });
    });

    it('应该能放弃番茄钟', () => {
      return request(app.getHttpServer())
        .post('/time-management/pomodoro/start')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          taskId: taskId,
          duration: 25,
        })
        .then((res) => {
          const abandonId = res.body.data.id;
          return request(app.getHttpServer())
            .patch(`/time-management/pomodoro/${abandonId}/abandon`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.success).toBe(true);
              expect(res.body.data.status).toBe('ABANDONED');
            });
        });
    });

    it('应该成功获取番茄钟记录', () => {
      return request(app.getHttpServer())
        .get('/time-management/pomodoro/records')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
  });

  describe('3. 时间统计功能', () => {
    it('应该成功获取每日工作时长', () => {
      const today = new Date().toISOString().split('T')[0];
      return request(app.getHttpServer())
        .get(`/time-management/stats/daily?date=${today}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalDuration');
          expect(res.body.data).toHaveProperty('records');
        });
    });

    it('应该成功获取每周工作时长', () => {
      return request(app.getHttpServer())
        .get('/time-management/stats/weekly')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalDuration');
          expect(res.body.data).toHaveProperty('dailyBreakdown');
        });
    });

    it('应该成功获取每月工作时长', () => {
      return request(app.getHttpServer())
        .get('/time-management/stats/monthly')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalDuration');
        });
    });

    it('应该成功获取番茄钟统计', () => {
      return request(app.getHttpServer())
        .get('/time-management/pomodoro/stats')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('total');
          expect(res.body.data).toHaveProperty('completed');
          expect(res.body.data).toHaveProperty('abandoned');
        });
    });
  });

  describe('4. 数据统计功能', () => {
    it('应该成功获取任务完成率统计', () => {
      return request(app.getHttpServer())
        .get('/statistics/completion-rate')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('totalTasks');
          expect(res.body.data).toHaveProperty('completedTasks');
          expect(res.body.data).toHaveProperty('completionRate');
        });
    });

    it('应该成功获取分类统计', () => {
      return request(app.getHttpServer())
        .get('/statistics/by-category')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('应该成功获取优先级统计', () => {
      return request(app.getHttpServer())
        .get('/statistics/by-priority')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('应该成功获取效率分析', () => {
      return request(app.getHttpServer())
        .get('/statistics/efficiency')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('averageCompletionTime');
        });
    });

    it('应该支持按日期范围查询', () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      return request(app.getHttpServer())
        .get(`/statistics/completion-rate?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('5. 报表导出功能', () => {
    it('应该成功导出 Excel 报表', () => {
      return request(app.getHttpServer())
        .post('/statistics/export/excel')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        })
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain('spreadsheet');
        });
    });

    it('应该成功导出 PDF 报表', () => {
      return request(app.getHttpServer())
        .post('/statistics/export/pdf')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
        })
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-type']).toContain('pdf');
        });
    });
  });
});

