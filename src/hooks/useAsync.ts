import { useEffect, useState } from 'react';
import { errorMessage } from '../api/client';

export interface AsyncState<T> {
  /** Latest successful result; kept while a newer request is in flight (stale-while-revalidate). */
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface Settled<T> {
  load: unknown;
  data: T | null;
  error: string | null;
}

/**
 * Runs `load` whenever its identity changes (memoize it with useCallback), aborting the
 * previous request so a slow stale response can never overwrite a newer one.
 */
export function useAsync<T>(load: (signal: AbortSignal) => Promise<T>): AsyncState<T> {
  const [settled, setSettled] = useState<Settled<T>>({ load: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ load, data, error: null });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setSettled((prev) => ({ load, data: prev.data, error: errorMessage(err) }));
      });

    return () => controller.abort();
  }, [load]);

  // "Loading" is derived: the last settled result belongs to an older request.
  const isCurrent = settled.load === load;
  return {
    data: settled.data,
    loading: !isCurrent,
    error: isCurrent ? settled.error : null,
  };
}
