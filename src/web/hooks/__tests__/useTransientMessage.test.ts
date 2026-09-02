import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TRANSIENT_MESSAGE_MS, useTransientMessage } from '../useTransientMessage';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('useTransientMessage', () => {
  it('starts hidden and exposes the message with its kind', () => {
    const { result } = renderHook(() => useTransientMessage());

    expect(result.current.message).toBeNull();

    act(() => {
      result.current.showMessage('Command copied', 'success');
    });

    expect(result.current.message).toEqual({ text: 'Command copied', kind: 'success' });
  });

  it('clears the message after the default five seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTransientMessage());

    act(() => {
      result.current.showMessage('Command copied', 'success');
    });
    expect(result.current.message).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(TRANSIENT_MESSAGE_MS - 1);
    });
    expect(result.current.message).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.message).toBeNull();
  });

  it('restarts the window when a new message replaces a pending one', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTransientMessage());

    act(() => {
      result.current.showMessage('Command copied', 'success');
    });
    act(() => {
      vi.advanceTimersByTime(TRANSIENT_MESSAGE_MS - 1000);
    });

    act(() => {
      result.current.showMessage('Copied again', 'error');
    });
    act(() => {
      vi.advanceTimersByTime(TRANSIENT_MESSAGE_MS - 1000);
    });
    expect(result.current.message).toEqual({ text: 'Copied again', kind: 'error' });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.message).toBeNull();
  });

  it('honors a custom duration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useTransientMessage(1500));

    act(() => {
      result.current.showMessage('Saved', 'success');
    });
    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(result.current.message).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.message).toBeNull();
  });

  it('clears the pending timer on unmount', () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
    const { result, unmount } = renderHook(() => useTransientMessage());

    act(() => {
      result.current.showMessage('Command copied', 'success');
    });
    const pendingTimer = setTimeoutSpy.mock.results[0]?.value;
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(pendingTimer);
  });
});
