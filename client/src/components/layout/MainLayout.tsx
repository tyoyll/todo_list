import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import ProtectedRoute from '../common/ProtectedRoute';
import Header from './Header';
import Sidebar from './Sidebar';

const { Content } = Layout;

/**
 * 主布局组件
 */
const MainLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Layout>
          <Sidebar />
          <Content style={{ padding: '24px', background: '#f0f2f5' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ProtectedRoute>
  );
};

export default MainLayout;

