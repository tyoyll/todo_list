import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createTask, updateTask, fetchTaskById } from '../../store/slices/taskSlice';
import TaskForm from '../../components/tasks/TaskForm';
import { CreateTaskDto, UpdateTaskDto } from '../../services/taskService';

/**
 * 任务表单页面（新建/编辑）
 */
const TaskFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentTask, loading } = useAppSelector((state) => state.tasks);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = Boolean(id && id !== 'new');

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchTaskById(id));
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (values: CreateTaskDto | UpdateTaskDto) => {
    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await dispatch(updateTask({ id, data: values })).unwrap();
        message.success('任务更新成功');
      } else {
        await dispatch(createTask(values as CreateTaskDto)).unwrap();
        message.success('任务创建成功');
      }
      navigate('/tasks');
    } catch (error: any) {
      message.error(error || (isEditMode ? '更新失败' : '创建失败'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title={isEditMode ? '编辑任务' : '新建任务'} loading={loading && isEditMode}>
        <TaskForm
          initialValues={isEditMode ? currentTask || undefined : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={submitting}
        />
      </Card>
    </div>
  );
};

export default TaskFormPage;

