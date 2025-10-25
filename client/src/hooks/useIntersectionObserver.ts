import { useEffect, useRef, useState } from 'react';

/**
 * 交叉观察器Hook
 * 用于懒加载、无限滚动等场景
 * 
 * @param options - IntersectionObserver配置
 * @returns [ref, isIntersecting] - DOM引用和是否可见
 * 
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 * return <div ref={ref}>{isVisible && <YourComponent />}</div>
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting] as const;
}

export default useIntersectionObserver;

