import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

/**
 * 受保护的路由组件
 * 只有已登录用户才能访问
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // 未登录，重定向到登录页，并记录原始访问位置
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

