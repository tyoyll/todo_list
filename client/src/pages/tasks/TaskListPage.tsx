import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTasks, deleteTask, fetchTaskStats } from '../../store/slices/taskSlice';
import { Task, TaskStatus, TaskPriority, TaskQueryParams } from '../../services/taskService';
import './TaskListPage.scss';

const { Search } = Input;
const { Option } = Select;

/**
 * 任务列表页面
 */
const TaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tasks, meta, stats, loading } = useAppSelector((state) => state.tasks);
  
  const [queryParams, setQueryParams] = useState<TaskQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  useEffect(() => {
    dispatch(fetchTasks(queryParams));
    dispatch(fetchTaskStats());
  }, [dispatch, queryParams]);

  const handleSearch = (value: string) => {
    setQueryParams({
      ...queryParams,
      search: value || undefined,
      page: 1,
    });
  };

  const handleFilterChange = (field: string, value: any) => {
    setQueryParams({
      ...queryParams,
      [field]: value || undefined,
      page: 1,
    });
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setQueryParams({
      ...queryParams,
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTask(id)).unwrap();
      message.success('任务已删除');
      dispatch(fetchTasks(queryParams));
      dispatch(fetchTaskStats());
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const getPriorityTag = (priority: TaskPriority) => {
    const config = {
      HIGH: { color: 'red', text: '高' },
      MEDIUM: { color: 'orange', text: '中' },
      LOW: { color: 'blue', text: '低' },
    };
    const item = config[priority];
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  const getStatusTag = (status: TaskStatus) => {
    const config = {
      TODO: { color: 'default', text: '待办', icon: <ClockCircleOutlined /> },
      IN_PROGRESS: { color: 'processing', text: '进行中', icon: <ExclamationCircleOutlined /> },
      COMPLETED: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
    };
    const item = config[status];
    return <Tag color={item.color} icon={item.icon}>{item.text}</Tag>;
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: '10%',
      render: (priority: TaskPriority) => getPriorityTag(priority),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: TaskStatus) => getStatusTag(status),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: '12%',
      ellipsis: true,
    },
    {
      title: '截止时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: '15%',
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: '18%',
      render: (_: any, record: Task) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/tasks/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/tasks/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个任务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="task-list-page">
      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={stats?.total || 0}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待办"
              value={stats?.todo || 0}
              valueStyle={{ color: '#666' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats?.inProgress || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats?.completed || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
              suffix={`/ ${stats?.completionRate.toFixed(1)}%`}
            />
          </Card>
        </Col>
      </Row>

      {/* 任务列表卡片 */}
      <Card
        title="任务列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/tasks/new')}
          >
            新建任务
          </Button>
        }
      >
        {/* 筛选和搜索 */}
        <Row gutter={16} className="filter-row">
          <Col span={8}>
            <Search
              placeholder="搜索任务标题或描述"
              allowClear
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="状态"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value={TaskStatus.TODO}>待办</Option>
              <Option value={TaskStatus.IN_PROGRESS}>进行中</Option>
              <Option value={TaskStatus.COMPLETED}>已完成</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="优先级"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('priority', value)}
            >
              <Option value={TaskPriority.HIGH}>高</Option>
              <Option value={TaskPriority.MEDIUM}>中</Option>
              <Option value={TaskPriority.LOW}>低</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Input
              placeholder="分类"
              allowClear
              onChange={(e) => handleFilterChange('category', e.target.value)}
            />
          </Col>
        </Row>

        {/* 任务表格 */}
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: meta?.page || 1,
            pageSize: meta?.limit || 10,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
};

export default TaskListPage;
