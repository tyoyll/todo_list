import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import './AuthLayout.scss';

const { Content } = Layout;

/**
 * 认证页面布局
 * 用于登录、注册等页面
 */
const AuthLayout: React.FC = () => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <div className="auth-container">
          <div className="auth-header">
            <h1>Todo List</h1>
            <p>高效的任务管理工具</p>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;

