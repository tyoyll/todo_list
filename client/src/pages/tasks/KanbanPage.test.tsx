import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import KanbanPage from './KanbanPage';
import { taskService } from '@/services/taskService';
import { Task, TaskStatus, TaskPriority } from '@/types';

// Mock taskService
vi.mock('@/services/taskService', () => ({
  taskService: {
    getTasks: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('KanbanPage Component', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      title: '待办任务',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: '进行中任务',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: '已完成任务',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.LOW,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (taskService.getTasks as any).mockResolvedValue({
      data: mockTasks,
      total: 3,
    });
  });

  const renderKanbanPage = () => {
    return render(
      <BrowserRouter>
        <KanbanPage />
      </BrowserRouter>
    );
  };

  it('应该正确渲染看板页面', async () => {
    renderKanbanPage();

    expect(screen.getByText('任务看板')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('待办任务')).toBeInTheDocument();
      expect(screen.getByText('进行中任务')).toBeInTheDocument();
      expect(screen.getByText('已完成任务')).toBeInTheDocument();
    });
  });

  it('应该显示搜索框', () => {
    renderKanbanPage();

    const searchInput = screen.getByPlaceholderText('搜索任务...');
    expect(searchInput).toBeInTheDocument();
  });

  it('应该显示优先级筛选器', () => {
    renderKanbanPage();

    // Ant Design Select会渲染为一个包含文本的元素
    expect(screen.getByText('全部优先级')).toBeInTheDocument();
  });

  it('应该显示新建任务按钮', () => {
    renderKanbanPage();

    const createButton = screen.getByRole('button', { name: /新建任务/i });
    expect(createButton).toBeInTheDocument();
  });

  it('应该显示加载状态', () => {
    (taskService.getTasks as any).mockImplementation(
      () => new Promise(() => {}), // 永远不resolve
    );

    renderKanbanPage();

    expect(screen.getByText('加载中...')).toBeInTheDocument();
  });

  it('应该按状态分组显示任务', async () => {
    renderKanbanPage();

    await waitFor(() => {
      expect(screen.getByText('待办事项')).toBeInTheDocument();
      expect(screen.getByText('进行中')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });
  });

  it('应该调用getTasks加载任务', async () => {
    renderKanbanPage();

    await waitFor(() => {
      expect(taskService.getTasks).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 1000,
        }),
      );
    });
  });

  it('应该支持搜索功能', async () => {
    renderKanbanPage();

    await waitFor(() => {
      expect(taskService.getTasks).toHaveBeenCalled();
    });

    vi.clearAllMocks();

    const searchInput = screen.getByPlaceholderText('搜索任务...');
    const searchButton = searchInput.nextElementSibling?.querySelector(
      'button',
    );

    if (searchButton) {
      searchButton.click();
    }

    await waitFor(() => {
      expect(taskService.getTasks).toHaveBeenCalled();
    });
  });
});

