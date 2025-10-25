import { useRef, useEffect, useState, ReactNode } from 'react';

/**
 * 虚拟滚动列表组件
 * 用于优化大列表渲染性能
 */

interface VirtualListProps<T> {
  // 数据列表
  items: T[];
  // 每项的高度
  itemHeight: number;
  // 容器高度
  containerHeight: number;
  // 渲染项的函数
  renderItem: (item: T, index: number) => ReactNode;
  // 缓冲区大小（额外渲染的项数）
  overscan?: number;
  // 容器类名
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见项
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // 实际要渲染的项
  const visibleItems = items.slice(startIndex, endIndex);

  // 总高度
  const totalHeight = items.length * itemHeight;

  // 偏移量
  const offsetY = startIndex * itemHeight;

  // 监听滚动
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      {/* 占位元素，撑起滚动条 */}
      <div style={{ height: totalHeight, width: '100%' }}>
        {/* 可见项容器 */}
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;

