import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskNote } from './task-note.entity';
import { Attachment } from './attachment.entity';

/**
 * 任务实体
 * 存储任务信息和状态
 */
@Entity('tasks')
@Index(['userId'])
@Index(['status'])
@Index(['priority'])
@Index(['dueDate'])
@Index(['userId', 'status'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
  })
  priority: 'HIGH' | 'MEDIUM' | 'LOW';

  @Column({
    type: 'enum',
    enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
    default: 'TODO',
  })
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

  @Column({ nullable: true, length: 100 })
  category?: string;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ nullable: true, comment: '预计完成时间（分钟）' })
  estimatedDuration?: number;

  @Column({ nullable: true, comment: '实际完成时间（分钟）' })
  actualDuration?: number;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // 关系定义
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => TaskNote, (taskNote) => taskNote.task)
  taskNotes: TaskNote[];

  @OneToMany(() => Attachment, (attachment) => attachment.task)
  attachments: Attachment[];
}
