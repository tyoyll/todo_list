import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 初始数据库迁移
 * 创建所有实体对应的数据库表
 */
export class InitialMigration1697623200000 implements MigrationInterface {
  name = 'InitialMigration1697623200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建用户表
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(50) NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "nickname" character varying(100),
        "avatarUrl" character varying,
        "theme" "public"."users_theme_enum" NOT NULL DEFAULT 'light',
        "notificationsEnabled" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // 创建用户设置表
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "workDuration" integer NOT NULL DEFAULT 25,
        "restDuration" integer NOT NULL DEFAULT 5,
        "notificationEnabled" boolean NOT NULL DEFAULT true,
        "emailNotification" boolean NOT NULL DEFAULT true,
        "theme" "public"."user_settings_theme_enum" NOT NULL DEFAULT 'AUTO',
        "language" "public"."user_settings_language_enum" NOT NULL DEFAULT 'ZH',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_986a2b6d3c05eb4091bb8066f78" UNIQUE ("userId"),
        CONSTRAINT "PK_4ed056b9344e6bcf76fff63c39a" PRIMARY KEY ("id")
      )
    `);

    // 创建任务表
    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying(200) NOT NULL,
        "description" text,
        "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO',
        "category" character varying(100),
        "tags" json,
        "dueDate" TIMESTAMP,
        "estimatedDuration" integer,
        "actualDuration" integer,
        "completedAt" TIMESTAMP,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id")
      )
    `);

    // 创建任务笔记表
    await queryRunner.query(`
      CREATE TABLE "task_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "taskId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "content" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5a7078e1f11a264a4afd7a7b00f" PRIMARY KEY ("id")
      )
    `);

    // 创建附件表
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "taskId" uuid NOT NULL,
        "fileName" character varying NOT NULL,
        "filePath" character varying NOT NULL,
        "fileSize" integer NOT NULL,
        "mimeType" character varying NOT NULL,
        "uploadedBy" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_5e1f050bcff31e3084a1d472638" PRIMARY KEY ("id")
      )
    `);

    // 创建时间记录表
    await queryRunner.query(`
      CREATE TABLE "time_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "taskId" uuid,
        "recordType" "public"."time_records_recordtype_enum" NOT NULL DEFAULT 'WORK',
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP,
        "duration" integer NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c5f0f0f4485d068b7d8b5a4b5e5" PRIMARY KEY ("id")
      )
    `);

    // 创建番茄钟记录表
    await queryRunner.query(`
      CREATE TABLE "pomodoro_records" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "taskId" uuid,
        "workDuration" integer NOT NULL DEFAULT 25,
        "restDuration" integer NOT NULL DEFAULT 5,
        "completedCycles" integer NOT NULL DEFAULT 0,
        "startedAt" TIMESTAMP NOT NULL,
        "completedAt" TIMESTAMP,
        "status" "public"."pomodoro_records_status_enum" NOT NULL DEFAULT 'RUNNING',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_2d7a3a6d7a3a6d7a3a6d7a3a6d" PRIMARY KEY ("id")
      )
    `);

    // 创建通知表
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying(100) NOT NULL,
        "message" text NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "readAt" TIMESTAMP,
        "relatedTaskId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
      )
    `);

    // 创建外键关系
    await queryRunner.query(`
      ALTER TABLE "user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "tasks" ADD CONSTRAINT "FK_166bd96559cb38595d392f75a35" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "task_notes" ADD CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe" 
      FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "task_notes" ADD CONSTRAINT "FK_e41a2d6f2c41d8e1a4cc3a5357c" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "attachments" ADD CONSTRAINT "FK_1a3f6e5ff1f76ea7a7d3c760837" 
      FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "attachments" ADD CONSTRAINT "FK_7c3320b0aaf6e3e2548ce3e13a8" 
      FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "time_records" ADD CONSTRAINT "FK_5e2c18d0c45047e83b48171e3a6" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "time_records" ADD CONSTRAINT "FK_4c1a5f15e0f6c8a1a5a0a8a8a8a" 
      FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "pomodoro_records" ADD CONSTRAINT "FK_3b3b3b3b3b3b3b3b3b3b3b3b3b" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "pomodoro_records" ADD CONSTRAINT "FK_4d4d4d4d4d4d4d4d4d4d4d4d4d" 
      FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" ADD CONSTRAINT "FK_5c52232c3833eb03c42d5d3f4e3" 
      FOREIGN KEY ("relatedTaskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // 创建索引
    await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "users" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_user_username" ON "users" ("username") `);
    await queryRunner.query(`CREATE INDEX "IDX_task_user_id" ON "tasks" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_task_status" ON "tasks" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_task_priority" ON "tasks" ("priority") `);
    await queryRunner.query(`CREATE INDEX "IDX_task_due_date" ON "tasks" ("dueDate") `);
    await queryRunner.query(`CREATE INDEX "IDX_task_user_status" ON "tasks" ("userId", "status") `);
    await queryRunner.query(`CREATE INDEX "IDX_timerecord_user_id" ON "time_records" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_timerecord_task_id" ON "time_records" ("taskId") `);
    await queryRunner.query(`CREATE INDEX "IDX_timerecord_start_time" ON "time_records" ("startTime") `);
    await queryRunner.query(`CREATE INDEX "IDX_notification_user_id" ON "notifications" ("userId") `);
    await queryRunner.query(`CREATE INDEX "IDX_notification_is_read" ON "notifications" ("isRead") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除索引
    await queryRunner.query(`DROP INDEX "IDX_notification_is_read"`);
    await queryRunner.query(`DROP INDEX "IDX_notification_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_timerecord_start_time"`);
    await queryRunner.query(`DROP INDEX "IDX_timerecord_task_id"`);
    await queryRunner.query(`DROP INDEX "IDX_timerecord_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_task_user_status"`);
    await queryRunner.query(`DROP INDEX "IDX_task_due_date"`);
    await queryRunner.query(`DROP INDEX "IDX_task_priority"`);
    await queryRunner.query(`DROP INDEX "IDX_task_status"`);
    await queryRunner.query(`DROP INDEX "IDX_task_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_user_username"`);
    await queryRunner.query(`DROP INDEX "IDX_user_email"`);

    // 删除外键
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_5c52232c3833eb03c42d5d3f4e3"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
    await queryRunner.query(`ALTER TABLE "pomodoro_records" DROP CONSTRAINT "FK_4d4d4d4d4d4d4d4d4d4d4d4d4d"`);
    await queryRunner.query(`ALTER TABLE "pomodoro_records" DROP CONSTRAINT "FK_3b3b3b3b3b3b3b3b3b3b3b3b3b"`);
    await queryRunner.query(`ALTER TABLE "time_records" DROP CONSTRAINT "FK_4c1a5f15e0f6c8a1a5a0a8a8a8a"`);
    await queryRunner.query(`ALTER TABLE "time_records" DROP CONSTRAINT "FK_5e2c18d0c45047e83b48171e3a6"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_7c3320b0aaf6e3e2548ce3e13a8"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_1a3f6e5ff1f76ea7a7d3c760837"`);
    await queryRunner.query(`ALTER TABLE "task_notes" DROP CONSTRAINT "FK_e41a2d6f2c41d8e1a4cc3a5357c"`);
    await queryRunner.query(`ALTER TABLE "task_notes" DROP CONSTRAINT "FK_3797a20ef5553ae87af126bc2fe"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_166bd96559cb38595d392f75a35"`);
    await queryRunner.query(`ALTER TABLE "user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`);

    // 删除表
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "pomodoro_records"`);
    await queryRunner.query(`DROP TABLE "time_records"`);
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "task_notes"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
