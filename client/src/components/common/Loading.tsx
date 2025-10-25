import { Spin } from 'antd';

/**
 * 加载中组件
 */
const Loading = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px' 
    }}>
      <Spin size="large" />
    </div>
  );
};

export default Loading;

