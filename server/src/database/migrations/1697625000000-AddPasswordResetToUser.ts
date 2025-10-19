import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

/**
 * 添加密码重置相关字段到用户表
 */
export class AddPasswordResetToUser1697625000000 implements MigrationInterface {
  name = 'AddPasswordResetToUser1697625000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 添加 resetPasswordToken 字段
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'resetPasswordToken',
        type: 'varchar',
        isNullable: true,
      }),
    );

    // 添加 resetPasswordExpires 字段
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'resetPasswordExpires',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除字段
    await queryRunner.dropColumn('users', 'resetPasswordExpires');
    await queryRunner.dropColumn('users', 'resetPasswordToken');
  }
}

