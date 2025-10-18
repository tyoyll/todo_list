import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';

// 布局组件
const MainLayout = React.lazy(() => import('../components/layout/MainLayout'));
const AuthLayout = React.lazy(() => import('../components/layout/AuthLayout'));

// 页面组件
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const TaskListPage = React.lazy(() => import('../pages/tasks/TaskListPage'));
const TaskDetailPage = React.lazy(() => import('../pages/tasks/TaskDetailPage'));
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/error/NotFoundPage'));

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'tasks',
        element: <TaskListPage />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetailPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

