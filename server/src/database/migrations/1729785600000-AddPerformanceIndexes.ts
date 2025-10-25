import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 性能优化：添加数据库索引
 * 提高常用查询的性能
 */
export class AddPerformanceIndexes1729785600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 任务表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_user_status" ON "tasks" ("userId", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_user_priority" ON "tasks" ("userId", "priority")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_deadline" ON "tasks" ("dueDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_created" ON "tasks" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_category" ON "tasks" ("category")`,
    );

    // 时间记录表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_time_record_user" ON "time_records" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_time_record_task" ON "time_records" ("taskId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_time_record_date" ON "time_records" ("startTime")`,
    );

    // 番茄钟记录表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pomodoro_user" ON "pomodoro_records" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pomodoro_task" ON "pomodoro_records" ("taskId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pomodoro_date" ON "pomodoro_records" ("startTime")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_pomodoro_status" ON "pomodoro_records" ("status")`,
    );

    // 通知表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notification_user" ON "notifications" ("userId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notification_read" ON "notifications" ("isRead")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notification_created" ON "notifications" ("createdAt")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notification_type" ON "notifications" ("type")`,
    );

    // 用户表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_username" ON "users" ("username")`,
    );

    // 任务笔记表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_task_note_task" ON "task_notes" ("taskId")`,
    );

    // 附件表索引
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_attachment_task" ON "attachments" ("taskId")`,
    );

    console.log('✅ 性能索引创建成功');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除任务表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_user_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_user_priority"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_deadline"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_category"`);

    // 删除时间记录表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_time_record_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_time_record_task"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_time_record_date"`);

    // 删除番茄钟记录表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pomodoro_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pomodoro_task"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pomodoro_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_pomodoro_status"`);

    // 删除通知表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_read"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notification_type"`);

    // 删除用户表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_email"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_username"`);

    // 删除任务笔记表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_task_note_task"`);

    // 删除附件表索引
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_attachment_task"`);

    console.log('✅ 性能索引删除成功');
  }
}

