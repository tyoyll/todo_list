import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';

// 布局组件
const MainLayout = React.lazy(() => import('../components/layout/MainLayout'));
const AuthLayout = React.lazy(() => import('../components/layout/AuthLayout'));

// 页面组件
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/auth/ForgotPasswordPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const TaskListPage = React.lazy(() => import('../pages/tasks/TaskListPage'));
const TaskDetailPage = React.lazy(() => import('../pages/tasks/TaskDetailPage'));
const TaskFormPage = React.lazy(() => import('../pages/tasks/TaskFormPage'));
const SettingsPage = React.lazy(() => import('../pages/settings/SettingsPage'));
const NotFoundPage = React.lazy(() => import('../pages/error/NotFoundPage'));

// 时间管理页面
const TimerPage = React.lazy(() => import('../pages/time-management/TimerPage'));
const PomodoroPage = React.lazy(() => import('../pages/time-management/PomodoroPage'));
const TimeRecordsPage = React.lazy(() => import('../pages/time-management/TimeRecordsPage'));

// 统计页面
const StatisticsPage = React.lazy(() => import('../pages/statistics/StatisticsPage'));
const ReportPage = React.lazy(() => import('../pages/statistics/ReportPage'));

// 通知页面
const NotificationSettingsPage = React.lazy(() => import('../pages/notifications/NotificationSettingsPage'));

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
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
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
        path: 'tasks/new',
        element: <TaskFormPage />,
      },
      {
        path: 'tasks/:id',
        element: <TaskDetailPage />,
      },
      {
        path: 'tasks/:id/edit',
        element: <TaskFormPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      // 时间管理路由
      {
        path: 'time-management/timer',
        element: <TimerPage />,
      },
      {
        path: 'time-management/pomodoro',
        element: <PomodoroPage />,
      },
      {
        path: 'time-management/records',
        element: <TimeRecordsPage />,
      },
      // 统计路由
      {
        path: 'statistics',
        element: <StatisticsPage />,
      },
      {
        path: 'statistics/report',
        element: <ReportPage />,
      },
      // 通知路由
      {
        path: 'notifications/settings',
        element: <NotificationSettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

