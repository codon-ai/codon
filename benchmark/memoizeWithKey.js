export function memoize(fn, keyResolver = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  function memoized(...args) {
    const key = keyResolver(...args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}
