import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  BellOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './Sidebar.scss';

const { Sider } = Layout;

/**
 * 侧边栏组件
 */
const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/tasks',
      icon: <CheckSquareOutlined />,
      label: '任务管理',
    },
    {
      key: 'time-management',
      icon: <ClockCircleOutlined />,
      label: '时间管理',
      children: [
        {
          key: '/time-management/timer',
          label: '工作计时器',
        },
        {
          key: '/time-management/pomodoro',
          label: '番茄钟',
        },
        {
          key: '/time-management/records',
          label: '工作记录',
        },
      ],
    },
    {
      key: 'statistics',
      icon: <BarChartOutlined />,
      label: '数据统计',
      children: [
        {
          key: '/statistics',
          label: '统计仪表板',
        },
        {
          key: '/statistics/report',
          label: '报表导出',
        },
      ],
    },
    {
      key: '/notifications/settings',
      icon: <BellOutlined />,
      label: '通知设置',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    return [path];
  };

  // 获取展开的菜单项
  const getOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/time-management')) {
      return ['time-management'];
    }
    if (path.startsWith('/statistics')) {
      return ['statistics'];
    }
    return [];
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="app-sidebar"
      width={220}
    >
      <Menu
        mode="inline"
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;

