export function asyncDebounce(fn, waitMs) {
  let timer = null;
  let pendingResolvers = [];
  return (...args) => new Promise((resolve, reject) => {
    pendingResolvers.push({ resolve, reject });
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const res = await fn(...args);
        pendingResolvers.forEach(p => p.resolve(res));
      } catch (err) {
        pendingResolvers.forEach(p => p.reject(err));
      } finally {
        pendingResolvers = [];
      }
    }, waitMs);
  });
}
