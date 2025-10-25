import { useEffect, useRef, useState } from 'react';

/**
 * 节流Hook
 * 用于限制函数执行频率
 * 
 * @param value - 要节流的值
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的值
 * 
 * @example
 * const throttledValue = useThrottle(scrollPosition, 200);
 */
export function useThrottle<T>(value: T, delay: number = 200): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastRun.current >= delay) {
        setThrottledValue(value);
        lastRun.current = Date.now();
      }
    }, delay - (Date.now() - lastRun.current));

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return throttledValue;
}

export default useThrottle;

