import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Divider,
  List,
  Input,
  Upload,
  message,
  Modal,
  Spin,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  FileOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTaskById, deleteTask } from '../../store/slices/taskSlice';
import taskService, { TaskNote, TaskAttachment, TaskStatus, TaskPriority } from '../../services/taskService';
import './TaskDetailPage.scss';

const { TextArea } = Input;

/**
 * 任务详情页面
 */
const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTask, loading } = useAppSelector((state) => state.tasks);
  
  const [notes, setNotes] = useState<TaskNote[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskById(id));
      loadNotes();
      loadAttachments();
    }
  }, [dispatch, id]);

  const loadNotes = async () => {
    if (!id) return;
    setLoadingNotes(true);
    try {
      const data = await taskService.getTaskNotes(id);
      setNotes(data);
    } catch (error) {
      message.error('加载笔记失败');
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadAttachments = async () => {
    if (!id) return;
    setLoadingAttachments(true);
    try {
      const data = await taskService.getAttachments(id);
      setAttachments(data);
    } catch (error) {
      message.error('加载附件失败');
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleAddNote = async () => {
    if (!id || !newNoteContent.trim()) {
      message.warning('请输入笔记内容');
      return;
    }

    setAddingNote(true);
    try {
      await taskService.addTaskNote(id, newNoteContent);
      setNewNoteContent('');
      loadNotes();
      message.success('笔记添加成功');
    } catch (error) {
      message.error('添加笔记失败');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!id) return;
    try {
      await taskService.deleteTaskNote(id, noteId);
      loadNotes();
      message.success('笔记已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleUpload = async (file: File) => {
    if (!id) return false;
    
    try {
      await taskService.uploadAttachment(id, file);
      loadAttachments();
      message.success('文件上传成功');
    } catch (error) {
      message.error('上传失败');
    }
    
    return false; // 阻止默认上传行为
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    try {
      await taskService.deleteAttachment(id, attachmentId);
      loadAttachments();
      message.success('附件已删除');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    Modal.confirm({
      title: '确定要删除这个任务吗？',
      content: '删除后无法恢复',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await dispatch(deleteTask(id)).unwrap();
          message.success('任务已删除');
          navigate('/tasks');
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
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
      TODO: { color: 'default', text: '待办' },
      IN_PROGRESS: { color: 'processing', text: '进行中' },
      COMPLETED: { color: 'success', text: '已完成' },
    };
    const item = config[status];
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  if (loading || !currentTask) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="task-detail-page">
      <Card
        title={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            >
              返回
            </Button>
            任务详情
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/tasks/${id}/edit`)}
            >
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        }
      >
        <Descriptions bordered column={2}>
          <Descriptions.Item label="标题" span={2}>
            {currentTask.title}
          </Descriptions.Item>
          
          <Descriptions.Item label="状态">
            {getStatusTag(currentTask.status)}
          </Descriptions.Item>
          
          <Descriptions.Item label="优先级">
            {getPriorityTag(currentTask.priority)}
          </Descriptions.Item>
          
          <Descriptions.Item label="分类">
            {currentTask.category || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="预计时长">
            {currentTask.estimatedDuration ? `${currentTask.estimatedDuration} 分钟` : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="截止时间" span={2}>
            {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleString() : '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="标签" span={2}>
            {currentTask.tags?.map((tag, index) => (
              <Tag key={index}>{tag}</Tag>
            )) || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="描述" span={2}>
            {currentTask.description || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="创建时间">
            {new Date(currentTask.createdAt).toLocaleString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="更新时间">
            {new Date(currentTask.updatedAt).toLocaleString()}
          </Descriptions.Item>
          
          {currentTask.completedAt && (
            <Descriptions.Item label="完成时间" span={2}>
              {new Date(currentTask.completedAt).toLocaleString()}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider>任务笔记</Divider>
        
        <div className="notes-section">
          <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
            <TextArea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="添加笔记..."
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddNote}
              loading={addingNote}
            >
              添加
            </Button>
          </Space.Compact>
          
          <List
            loading={loadingNotes}
            dataSource={notes}
            locale={{ emptyText: '暂无笔记' }}
            renderItem={(note) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  description={
                    <div>
                      <div>{note.content}</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>

        <Divider>附件</Divider>
        
        <div className="attachments-section">
          <Upload
            beforeUpload={handleUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>上传附件</Button>
          </Upload>
          
          <List
            loading={loadingAttachments}
            dataSource={attachments}
            locale={{ emptyText: '暂无附件' }}
            style={{ marginTop: 16 }}
            renderItem={(attachment) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleDeleteAttachment(attachment.id)}
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<FileOutlined style={{ fontSize: 24 }} />}
                  title={attachment.fileName}
                  description={
                    <Space>
                      <span>{(attachment.fileSize / 1024).toFixed(2)} KB</span>
                      <span>{new Date(attachment.createdAt).toLocaleString()}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </Card>
    </div>
  );
};

export default TaskDetailPage;
