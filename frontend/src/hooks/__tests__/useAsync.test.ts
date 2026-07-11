import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsync } from '../useAsync';

describe('useAsync', () => {
  it('starts in a loading state and resolves with data', async () => {
    const fetcher = vi.fn().mockResolvedValue({ hello: 'world' });
    const { result } = renderHook(() => useAsync(fetcher));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual({ hello: 'world' });
    expect(result.current.error).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('captures a rejected fetch as an error message', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Boom'));
    const { result } = renderHook(() => useAsync(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Boom');
    expect(result.current.data).toBeNull();
  });

  it('reload() re-invokes the fetcher and clears a previous error', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('First failure')).mockResolvedValueOnce({ ok: true });
    const { result } = renderHook(() => useAsync(fetcher));

    await waitFor(() => expect(result.current.error).toBe('First failure'));

    act(() => {
      result.current.reload();
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('setData supports optimistic local updates without refetching', async () => {
    const fetcher = vi.fn().mockResolvedValue([1, 2, 3]);
    const { result } = renderHook(() => useAsync<number[]>(fetcher));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setData((prev) => (prev ? prev.filter((n) => n !== 2) : prev));
    });

    expect(result.current.data).toEqual([1, 3]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
