import { Form, Input, Select, DatePicker, InputNumber, Button, Space } from 'antd';
import { Task, TaskPriority, CreateTaskDto, UpdateTaskDto } from '../../services/taskService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormProps {
  initialValues?: Task;
  onSubmit: (values: CreateTaskDto | UpdateTaskDto) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 任务表单组件
 */
const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    const formData = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.toISOString() : undefined,
      tags: values.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean),
    };
    
    await onSubmit(formData);
  };

  // 设置初始值
  const formInitialValues = initialValues
    ? {
        ...initialValues,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
        tags: initialValues.tags?.join(', '),
      }
    : {
        priority: TaskPriority.MEDIUM,
      };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={formInitialValues}
      onFinish={handleFinish}
      autoComplete="off"
    >
      <Form.Item
        label="任务标题"
        name="title"
        rules={[
          { required: true, message: '请输入任务标题' },
          { max: 200, message: '标题最多200个字符' },
        ]}
      >
        <Input placeholder="请输入任务标题" />
      </Form.Item>

      <Form.Item
        label="任务描述"
        name="description"
        rules={[{ max: 5000, message: '描述最多5000个字符' }]}
      >
        <TextArea
          rows={4}
          placeholder="请输入任务描述"
          showCount
          maxLength={5000}
        />
      </Form.Item>

      <Form.Item
        label="优先级"
        name="priority"
        rules={[{ required: true, message: '请选择优先级' }]}
      >
        <Select>
          <Option value={TaskPriority.HIGH}>高</Option>
          <Option value={TaskPriority.MEDIUM}>中</Option>
          <Option value={TaskPriority.LOW}>低</Option>
        </Select>
      </Form.Item>

      <Form.Item label="分类" name="category">
        <Input placeholder="例如：工作、学习、生活" />
      </Form.Item>

      <Form.Item
        label="标签"
        name="tags"
        help="多个标签用逗号分隔"
      >
        <Input placeholder="例如：重要, 紧急" />
      </Form.Item>

      <Form.Item label="截止时间" name="dueDate">
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          style={{ width: '100%' }}
          placeholder="选择截止时间"
        />
      </Form.Item>

      <Form.Item
        label="预计时长（分钟）"
        name="estimatedDuration"
        rules={[{ type: 'number', min: 1, message: '预计时长至少为1分钟' }]}
      >
        <InputNumber
          min={1}
          style={{ width: '100%' }}
          placeholder="预计完成任务需要的时间"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {initialValues ? '更新' : '创建'}
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;

