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
 * 番茄钟记录实体
 * 存储用户的番茄工作法记录
 */
@Entity('pomodoro_records')
@Index(['userId'])
@Index(['taskId'])
@Index(['status'])
export class PomodoroRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  taskId?: string;

  @Column({ default: 25, comment: '工作时长（分钟）' })
  workDuration: number;

  @Column({ default: 5, comment: '休息时长（分钟）' })
  restDuration: number;

  @Column({ default: 0, comment: '已完成的循环次数' })
  completedCycles: number;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({
    type: 'enum',
    enum: ['RUNNING', 'COMPLETED', 'ABANDONED'],
    default: 'RUNNING',
  })
  status: 'RUNNING' | 'COMPLETED' | 'ABANDONED';

  @CreateDateColumn()
  createdAt: Date;

  // 关系定义
  @ManyToOne(() => User, (user) => user.pomodoroRecords)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task?: Task;
}
