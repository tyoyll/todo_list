import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { TimeRecord } from '../../time-management/entities/time-record.entity';
import { PomodoroRecord } from '../../time-management/entities/pomodoro-record.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { UserSettings } from './user-settings.entity';

/**
 * 用户实体
 * 存储用户基本信息和认证数据
 */
@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, length: 100 })
  nickname?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: ['light', 'dark'],
    default: 'light',
  })
  theme: 'light' | 'dark';

  @Column({ default: true })
  notificationsEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // 关系定义
  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => TimeRecord, (timeRecord) => timeRecord.user)
  timeRecords: TimeRecord[];

  @OneToMany(() => PomodoroRecord, (pomodoroRecord) => pomodoroRecord.user)
  pomodoroRecords: PomodoroRecord[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToOne(() => UserSettings, (userSettings) => userSettings.user)
  settings: UserSettings;
}
