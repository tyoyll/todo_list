import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials, setLoading } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import './RegisterPage.scss';

/**
 * 注册页面
 */
const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLocalLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await authService.register({
        username: values.username,
        email: values.email,
        password: values.password,
        nickname: values.nickname,
      });

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );

      message.success('注册成功');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="register-page">
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
        scrollToFirstError
      >
        <Form.Item
          name="username"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, message: '用户名至少3个字符' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名"
          />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="邮箱"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6个字符' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="确认密码"
          />
        </Form.Item>

        <Form.Item
          name="nickname"
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="昵称（可选）"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="register-button"
            loading={loading}
            block
          >
            注册
          </Button>
        </Form.Item>

        <div className="register-footer">
          已有账号？ <Link to="/auth/login">立即登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default RegisterPage;

