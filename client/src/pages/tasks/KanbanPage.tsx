import { useState, useEffect } from 'react';
import { message, Modal, Input, Select, Space, Button } from 'antd';
import { PlusOutlined, FilterOutlined } from '@ant-design/icons';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { taskService } from '@/services/taskService';
import { useNavigate } from 'react-router-dom';
import './KanbanPage.scss';

const { Search } = Input;
const { Option } = Select;

/**
 * 看板页面
 */
const KanbanPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  // 加载任务列表
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks({
        page: 1,
        limit: 1000, // 看板视图加载所有任务
        search: searchText || undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setTasks(response.data);
    } catch (error) {
      message.error('加载任务失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [searchText, priorityFilter]);

  // 处理任务状态变更
  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      message.success('任务状态已更新');
      
      // 更新本地状态
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      message.error('更新任务状态失败');
      console.error(error);
    }
  };

  // 处理任务编辑
  const handleTaskEdit = (task: Task) => {
    navigate(`/tasks/${task.id}/edit`);
  };

  // 处理任务删除
  const handleTaskDelete = (task: Task) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除任务"${task.title}"吗？`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await taskService.deleteTask(task.id);
          message.success('任务已删除');
          setTasks((prevTasks) => prevTasks.filter((t) => t.id !== task.id));
        } catch (error) {
          message.error('删除任务失败');
          console.error(error);
        }
      },
    });
  };

  // 处理创建新任务
  const handleCreateTask = () => {
    navigate('/tasks/new');
  };

  return (
    <div className="kanban-page">
      <div className="kanban-page-header">
        <h1>任务看板</h1>
        
        <div className="kanban-page-toolbar">
          <Space size="middle">
            <Search
              placeholder="搜索任务..."
              allowClear
              style={{ width: 250 }}
              onSearch={setSearchText}
              onChange={(e) => {
                if (!e.target.value) {
                  setSearchText('');
                }
              }}
            />

            <Select
              value={priorityFilter}
              style={{ width: 120 }}
              onChange={setPriorityFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">全部优先级</Option>
              <Option value={TaskPriority.LOW}>低</Option>
              <Option value={TaskPriority.MEDIUM}>中</Option>
              <Option value={TaskPriority.HIGH}>高</Option>
              <Option value={TaskPriority.URGENT}>紧急</Option>
            </Select>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
            >
              新建任务
            </Button>
          </Space>
        </div>
      </div>

      <div className="kanban-page-content">
        {loading ? (
          <div className="loading-container">加载中...</div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={handleTaskDelete}
          />
        )}
      </div>
    </div>
  );
};

export default KanbanPage;

