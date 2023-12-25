export type Options = {
  staleWhileRevalidate?: number;
  maxAge?: number;
  onError?: (error: any) => void;
};

type CacheItem<T> = {
  promise: Promise<T>;
  ts: number;
};

type Cache<T> = {
  [key: string]: CacheItem<T>;
};

export default function swrize<T, F extends () => Promise<T>>(
  fn: F,
  options?: Options
): F {
  const staleWhileRevalidate = (options?.staleWhileRevalidate || 0) * 1000;
  const maxAge = (options?.maxAge || 0) * 1000;

  const results: Cache<T> = {};
  const requests: Cache<T> = {};

  return function swrized(...args) {
    const key = JSON.stringify(args);
    const now = Date.now();

    const result = results[key];
    let request = requests[key];

    if (!request && (!result || result.ts + maxAge < now)) {
      const promise = Promise.resolve().then(() => fn(...args));
      request = { promise, ts: now };
      requests[key] = request;

      const cleanup = () => {
        if (results[key] === request) {
          delete results[key];
        }

        if (requests[key] === request) {
          delete requests[key];
        }
      };

      const onSuccess = () => {
        cleanup();
        results[key] = request;
      };

      const onError = (error: any) => {
        cleanup();
        options?.onError?.(error);
      };

      promise.then(onSuccess, onError);
      setTimeout(cleanup, maxAge + staleWhileRevalidate);
    }

    return Promise.resolve(result?.promise || request?.promise);
  } as F;
}
