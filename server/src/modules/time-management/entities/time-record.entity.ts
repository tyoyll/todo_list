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
 * 时间记录实体
 * 存储用户的工作和休息时间记录
 */
@Entity('time_records')
@Index(['userId'])
@Index(['taskId'])
@Index(['startTime'])
export class TimeRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  taskId?: string;

  @Column({
    type: 'enum',
    enum: ['WORK', 'REST'],
    default: 'WORK',
  })
  recordType: 'WORK' | 'REST';

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime?: Date;

  @Column({ comment: '持续时间（分钟）' })
  duration: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  // 关系定义
  @ManyToOne(() => User, (user) => user.timeRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task?: Task;
}
