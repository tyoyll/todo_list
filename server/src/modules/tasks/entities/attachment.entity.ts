import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

/**
 * 附件实体
 * 存储任务相关的文件附件
 */
@Entity('attachments')
@Index(['taskId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  taskId: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column()
  mimeType: string;

  @Column()
  uploadedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  // 关系定义
  @ManyToOne(() => Task, (task) => task.attachments)
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  user: User;
}
