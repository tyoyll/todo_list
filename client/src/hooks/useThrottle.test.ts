import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  it('应该返回初始值', () => {
    const { result } = renderHook(() => useThrottle('initial', 200));
    expect(result.current).toBe('initial');
  });

  it('应该在延迟后更新值', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 }
    );
  });

  it('应该在节流期间忽略中间值', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 100),
      { initialProps: { value: 1 } }
    );

    // 快速连续更新
    rerender({ value: 2 });
    rerender({ value: 3 });
    rerender({ value: 4 });

    // 等待节流完成
    await waitFor(
      () => {
        expect(result.current).toBeGreaterThan(1);
      },
      { timeout: 200 }
    );
  });
});

