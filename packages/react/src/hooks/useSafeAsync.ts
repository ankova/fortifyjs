import { useEffect, useState } from 'react';
import { safeAsync } from '@fortifyjs/core';
import type { Result } from '@fortifyjs/core';

type AsyncState<T> = {
  data?: T;
  error?: Error;
  loading: boolean;
};

export function useSafeAsync<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true });

    (async () => {
      const res: Result<T> = await safeAsync(fn);
      if (cancelled) return;

      if (res.ok) {
        setState({
          data: res.value,
          loading: false,
        });
      } else {
        const error = res.error instanceof Error ? res.error : new Error(String(res.error));

        setState({
          error,
          loading: false,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
