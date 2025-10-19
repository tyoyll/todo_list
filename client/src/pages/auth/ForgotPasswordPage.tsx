import { useState } from 'react';
import { Form, Input, Button, message, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './LoginPage.scss';

/**
 * 忘记密码页面
 */
const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      // TODO: 实现密码重置请求
      // await authService.forgotPassword(values.email);
      console.log('发送重置邮件到:', values.email);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      message.success('密码重置邮件已发送');
    } catch (error: any) {
      message.error(error.response?.data?.message || '发送失败');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="login-page">
        <Result
          status="success"
          title="邮件已发送"
          subTitle="请查收您的邮箱，并按照邮件中的指示重置密码"
          extra={[
            <Link to="/auth/login" key="login">
              <Button type="primary">返回登录</Button>
            </Link>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="form-header">
        <h2>忘记密码</h2>
        <p>请输入您的邮箱地址，我们将发送重置密码链接</p>
      </div>

      <Form
        form={form}
        name="forgot-password"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="邮箱地址"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-button"
            loading={loading}
            block
          >
            发送重置邮件
          </Button>
        </Form.Item>

        <div className="login-footer">
          <Link to="/auth/login">返回登录</Link>
        </div>
      </Form>
    </div>
  );
};

export default ForgotPasswordPage;

