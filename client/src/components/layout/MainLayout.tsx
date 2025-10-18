import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import ProtectedRoute from '../common/ProtectedRoute';

const { Content } = Layout;

/**
 * 主布局组件
 */
const MainLayout: React.FC = () => {
  return (
    <ProtectedRoute>
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ padding: '24px' }}>
          <Outlet />
        </Content>
      </Layout>
    </ProtectedRoute>
  );
};

export default MainLayout;

