import { useDroppable } from '@dnd-kit/core';
import { Badge, Typography, Empty } from 'antd';
import { Task, TaskStatus } from '@/types';
import KanbanCard from './KanbanCard';
import './KanbanColumn.scss';

const { Title } = Typography;

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  count: number;
  color: string;
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
}

/**
 * 看板列组件
 */
const KanbanColumn = ({
  id,
  title,
  count,
  color,
  tasks,
  onTaskEdit,
  onTaskDelete,
  onStatusChange,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div className={`kanban-column ${isOver ? 'kanban-column-over' : ''}`} ref={setNodeRef}>
      <div className="kanban-column-header" style={{ borderTopColor: color }}>
        <Title level={5} style={{ margin: 0 }}>
          {title}
        </Title>
        <Badge
          count={count}
          style={{ backgroundColor: color }}
          showZero
        />
      </div>

      <div className="kanban-column-content">
        {tasks.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无任务"
            style={{ marginTop: '24px' }}
          />
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;

