import { Card, Tag, Typography, Space, Button, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Task, TaskPriority, TaskStatus } from '@/types';
import dayjs from 'dayjs';
import './TaskCard.scss';

const { Text, Paragraph } = Typography;

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
  draggable?: boolean;
}

/**
 * 任务卡片组件
 */
const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  draggable = false,
}: TaskCardProps) => {
  // 优先级颜色映射
  const priorityColors: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: 'green',
    [TaskPriority.MEDIUM]: 'orange',
    [TaskPriority.HIGH]: 'red',
    [TaskPriority.URGENT]: 'magenta',
  };

  // 优先级文本映射
  const priorityLabels: Record<TaskPriority, string> = {
    [TaskPriority.LOW]: '低',
    [TaskPriority.MEDIUM]: '中',
    [TaskPriority.HIGH]: '高',
    [TaskPriority.URGENT]: '紧急',
  };

  // 状态文本映射
  const statusLabels: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: '待办',
    [TaskStatus.IN_PROGRESS]: '进行中',
    [TaskStatus.COMPLETED]: '已完成',
  };

  // 判断任务是否逾期
  const isOverdue = task.deadline && dayjs(task.deadline).isBefore(dayjs()) && task.status !== TaskStatus.COMPLETED;

  // 获取下一个状态
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus | null => {
    switch (currentStatus) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.COMPLETED;
      default:
        return null;
    }
  };

  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);
    if (nextStatus && onStatusChange) {
      onStatusChange(task, nextStatus);
    }
  };

  return (
    <Card
      className={`task-card ${draggable ? 'task-card-draggable' : ''} ${isOverdue ? 'task-card-overdue' : ''}`}
      size="small"
      hoverable
    >
      <div className="task-card-header">
        <Space size="small">
          <Tag color={priorityColors[task.priority]}>
            {priorityLabels[task.priority]}
          </Tag>
          {task.category && <Tag>{task.category}</Tag>}
          {isOverdue && <Tag color="red">已逾期</Tag>}
        </Space>
      </div>

      <div className="task-card-body">
        <Paragraph
          className="task-title"
          ellipsis={{ rows: 2, tooltip: task.title }}
          strong
        >
          {task.title}
        </Paragraph>

        {task.description && (
          <Paragraph
            className="task-description"
            ellipsis={{ rows: 2, tooltip: task.description }}
            type="secondary"
          >
            {task.description}
          </Paragraph>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="task-tags">
            {task.tags.map((tag, index) => (
              <Tag key={index} color="blue" style={{ margin: '2px' }}>
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <div className="task-card-footer">
        <div className="task-info">
          {task.deadline && (
            <Space size="small">
              <ClockCircleOutlined />
              <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: '12px' }}>
                {dayjs(task.deadline).format('MM-DD HH:mm')}
              </Text>
            </Space>
          )}
        </div>

        <div className="task-actions">
          <Space size="small">
            {getNextStatus(task.status) && (
              <Tooltip title={`标记为${statusLabels[getNextStatus(task.status)!]}`}>
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={handleStatusChange}
                />
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(task)}
                />
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(task)}
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;

