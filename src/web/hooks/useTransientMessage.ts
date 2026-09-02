import { useEffect, useRef, useState } from 'react';

export const TRANSIENT_MESSAGE_MS = 5000;

type TransientMessage = { text: string; kind: 'success' | 'error' } | null;

export function useTransientMessage(durationMs = TRANSIENT_MESSAGE_MS) {
  const [message, setMessage] = useState<TransientMessage>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function showMessage(text: string, kind: 'success' | 'error') {
    setMessage({ text, kind });
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setMessage(null);
    }, durationMs);
  }

  return { message, showMessage };
}
