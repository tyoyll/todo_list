import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * 用户设置实体
 * 存储用户的个性化设置
 */
@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ default: 25, comment: '工作时长（分钟）' })
  workDuration: number;

  @Column({ default: 5, comment: '休息时长（分钟）' })
  restDuration: number;

  @Column({ default: true, comment: '是否启用通知' })
  notificationEnabled: boolean;

  @Column({ default: true, comment: '是否启用邮件通知' })
  emailNotification: boolean;

  @Column({
    type: 'enum',
    enum: ['LIGHT', 'DARK', 'AUTO'],
    default: 'AUTO',
  })
  theme: 'LIGHT' | 'DARK' | 'AUTO';

  @Column({
    type: 'enum',
    enum: ['ZH', 'EN'],
    default: 'ZH',
  })
  language: 'ZH' | 'EN';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关系定义
  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn({ name: 'userId' })
  user: User;
}
