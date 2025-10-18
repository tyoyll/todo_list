import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

/**
 * 404页面
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在"
        extra={
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
};

export default NotFoundPage;

