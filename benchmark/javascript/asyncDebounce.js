export function asyncDebounce(fn, waitMs) {
  let timer = null;
  let pendingResolvers = [];
  return function (...args) {
    return new Promise((resolve, reject) => {
      pendingResolvers.push({ resolve, reject });
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          const current = pendingResolvers;
          pendingResolvers = [];
          for (const p of current) {
            p.resolve(result);
          }
        } catch (error) {
          const current = pendingResolvers;
          pendingResolvers = [];
          for (const p of current) {
            p.reject(error);
          }
        }
      }, waitMs);
    });
  };
}
