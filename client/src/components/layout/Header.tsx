import { Layout, Menu, Dropdown, Avatar, Space, Button, message } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import authService from '../../services/authService';
import './Header.scss';

const { Header: AntHeader } = Layout;

/**
 * 顶部导航栏组件
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      message.success('已退出登录');
      navigate('/auth/login');
    } catch (error) {
      // 即使API调用失败，也要清除本地状态
      dispatch(logout());
      navigate('/auth/login');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader className="app-header">
      <div className="header-left">
        <div className="logo" onClick={() => navigate('/')}>
          Todo App
        </div>
      </div>

      <div className="header-right">
        <Space size="large">
          <Button
            type="text"
            icon={<BellOutlined />}
            onClick={() => navigate('/notifications')}
          >
            通知
          </Button>

          <Dropdown
            menu={{ items: userMenuItems as any }}
            placement="bottomRight"
          >
            <Space className="user-info" style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user?.avatarUrl} />
              <span>{user?.nickname || user?.username}</span>
            </Space>
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;

