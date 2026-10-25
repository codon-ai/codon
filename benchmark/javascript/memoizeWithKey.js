export function memoize(fn, keyResolver) {
  const cache = new Map();
  const resolver = keyResolver || ((...args) => JSON.stringify(args));

  function memoized(...args) {
    const key = resolver(...args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}
