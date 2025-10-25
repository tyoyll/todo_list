import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loading from './Loading';

describe('Loading Component', () => {
  it('应该显示 Spin 组件', () => {
    const { container } = render(<Loading />);
    
    // 检查是否有 ant-spin 类
    const spinElement = container.querySelector('.ant-spin');
    expect(spinElement).toBeInTheDocument();
  });

  it('应该显示正确的大小', () => {
    const { container } = render(<Loading />);
    
    // 检查是否有 large 尺寸的类
    const spinElement = container.querySelector('.ant-spin-lg');
    expect(spinElement).toBeInTheDocument();
  });

  it('应该有正确的样式', () => {
    const { container } = render(<Loading />);
    
    // 检查外层容器样式
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center',
    });
  });
});

