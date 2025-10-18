import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

/**
 * 通知实体
 * 存储用户通知信息
 */
@Entity('notifications')
@Index(['userId'])
@Index(['isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['TASK_REMINDER', 'REST_REMINDER', 'ACHIEVEMENT', 'SYSTEM'],
  })
  type: 'TASK_REMINDER' | 'REST_REMINDER' | 'ACHIEVEMENT' | 'SYSTEM';

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  relatedTaskId?: string;

  @CreateDateColumn()
  createdAt: Date;

  // 关系定义
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'relatedTaskId' })
  relatedTask?: Task;
}
