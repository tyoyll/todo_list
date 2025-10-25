import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import './KanbanBoard.scss';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskStatusChange: (taskId: number, newStatus: TaskStatus) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
}

/**
 * 看板视图组件
 */
const KanbanBoard = ({
  tasks,
  onTaskStatusChange,
  onTaskEdit,
  onTaskDelete,
}: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 按状态分组任务
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    [TaskStatus.TODO]: tasks.filter((task) => task.status === TaskStatus.TODO),
    [TaskStatus.IN_PROGRESS]: tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS),
    [TaskStatus.COMPLETED]: tasks.filter((task) => task.status === TaskStatus.COMPLETED),
  };

  // 列配置
  const columns = [
    {
      id: TaskStatus.TODO,
      title: '待办事项',
      count: tasksByStatus[TaskStatus.TODO].length,
      color: '#1890ff',
    },
    {
      id: TaskStatus.IN_PROGRESS,
      title: '进行中',
      count: tasksByStatus[TaskStatus.IN_PROGRESS].length,
      color: '#fa8c16',
    },
    {
      id: TaskStatus.COMPLETED,
      title: '已完成',
      count: tasksByStatus[TaskStatus.COMPLETED].length,
      color: '#52c41a',
    },
  ];

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setActiveTask(task);
    }
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = Number(active.id);
    const overId = over.id;

    // 判断是拖到列上还是拖到其他任务上
    let newStatus: TaskStatus;
    if (Object.values(TaskStatus).includes(overId as TaskStatus)) {
      // 拖到列上
      newStatus = overId as TaskStatus;
    } else {
      // 拖到其他任务上，找到该任务所在的列
      const overTask = tasks.find((t) => t.id === Number(overId));
      if (!overTask) {
        setActiveTask(null);
        return;
      }
      newStatus = overTask.status;
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      onTaskStatusChange(taskId, newStatus);
    }

    setActiveTask(null);
  };

  // 拖拽取消
  const handleDragCancel = () => {
    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="kanban-board">
        {columns.map((column) => (
          <SortableContext
            key={column.id}
            items={tasksByStatus[column.id].map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              count={column.count}
              color={column.color}
              tasks={tasksByStatus[column.id]}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onStatusChange={(task, newStatus) => onTaskStatusChange(task.id, newStatus)}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div style={{ transform: 'rotate(5deg)' }}>
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;

