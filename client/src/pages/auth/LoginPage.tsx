import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials, setLoading } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import './LoginPage.scss';

/**
 * 登录页面
 */
const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [loading, setLocalLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: any) => {
    setLocalLoading(true);
    dispatch(setLoading(true));

    try {
      const response = await authService.login({
        username: values.username,
        password: values.password,
      });

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
          refreshToken: response.refreshToken,
        })
      );

      message.success('登录成功');
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLocalLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="login-page">
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="用户名"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <div className="login-options">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <a className="login-form-forgot" href="">
              忘记密码
            </a>
          </div>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={loading}
            block
          >
            登录
          </Button>
        </Form.Item>

        <div className="login-footer">
          还没有账号？ <Link to="/auth/register">立即注册</Link>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;

