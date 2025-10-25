import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from './TaskCard';
import { Task, TaskStatus, TaskPriority } from '@/types';
import dayjs from 'dayjs';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: 1,
    title: '测试任务',
    description: '这是一个测试任务的描述',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    category: '工作',
    tags: ['重要', '紧急'],
    deadline: dayjs().add(2, 'hour').toDate(),
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('应该正确渲染任务卡片', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('测试任务')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试任务的描述')).toBeInTheDocument();
  });

  it('应该显示优先级标签', () => {
    const { container } = render(<TaskCard task={mockTask} />);

    const priorityTag = container.querySelector('.ant-tag');
    expect(priorityTag).toBeInTheDocument();
    expect(priorityTag).toHaveTextContent('高');
  });

  it('应该显示分类标签', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('工作')).toBeInTheDocument();
  });

  it('应该显示任务标签', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('重要')).toBeInTheDocument();
    expect(screen.getByText('紧急')).toBeInTheDocument();
  });

  it('应该显示截止时间', () => {
    render(<TaskCard task={mockTask} />);

    const deadlineText = dayjs(mockTask.deadline).format('MM-DD HH:mm');
    expect(screen.getByText(deadlineText)).toBeInTheDocument();
  });

  it('应该显示逾期标签当任务逾期时', () => {
    const overdueTask = {
      ...mockTask,
      deadline: dayjs().subtract(1, 'hour').toDate(),
    };

    render(<TaskCard task={overdueTask} />);

    expect(screen.getByText('已逾期')).toBeInTheDocument();
  });

  it('应该调用编辑回调', () => {
    const onEdit = vi.fn();
    render(<TaskCard task={mockTask} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /编辑/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('应该调用删除回调', () => {
    const onDelete = vi.fn();
    render(<TaskCard task={mockTask} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /删除/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(mockTask);
  });

  it('应该调用状态变更回调', () => {
    const onStatusChange = vi.fn();
    render(<TaskCard task={mockTask} onStatusChange={onStatusChange} />);

    const statusButton = screen.getByRole('button', {
      name: /标记为进行中/i,
    });
    fireEvent.click(statusButton);

    expect(onStatusChange).toHaveBeenCalledWith(
      mockTask,
      TaskStatus.IN_PROGRESS,
    );
  });

  it('不应该显示状态转换按钮当任务已完成', () => {
    const completedTask = {
      ...mockTask,
      status: TaskStatus.COMPLETED,
    };

    render(<TaskCard task={completedTask} />);

    const statusButton = screen.queryByRole('button', {
      name: /标记为/i,
    });
    expect(statusButton).not.toBeInTheDocument();
  });

  it('应该有拖拽样式类当draggable为true', () => {
    const { container } = render(<TaskCard task={mockTask} draggable />);

    const card = container.querySelector('.task-card-draggable');
    expect(card).toBeInTheDocument();
  });

  it('应该有逾期样式类当任务逾期', () => {
    const overdueTask = {
      ...mockTask,
      deadline: dayjs().subtract(1, 'hour').toDate(),
    };

    const { container } = render(<TaskCard task={overdueTask} />);

    const card = container.querySelector('.task-card-overdue');
    expect(card).toBeInTheDocument();
  });
});

