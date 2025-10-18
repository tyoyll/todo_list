import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { Button, Card } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 仪表板页面
 */
const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div>
      <Card title="仪表板">
        <p>欢迎, {user?.username || user?.nickname}!</p>
        <p>Email: {user?.email}</p>
        <Button type="primary" onClick={handleLogout} style={{ marginTop: 16 }}>
          退出登录
        </Button>
      </Card>
    </div>
  );
};

export default DashboardPage;

