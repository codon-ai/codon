export function deepClone(val, hash = new WeakMap()) {
  if (val === null || typeof val !== "object") return val;
  if (val instanceof Date) return new Date(val.getTime());
  if (val instanceof RegExp) return new RegExp(val.source, val.flags);
  if (hash.has(val)) return hash.get(val);
  if (Array.isArray(val)) {
    const arr = [];
    hash.set(val, arr);
    val.forEach(item => arr.push(deepClone(item, hash)));
    return arr;
  }
  const clone = Object.create(Object.getPrototypeOf(val));
  hash.set(val, clone);
  for (const [k, v] of Object.entries(val)) {
    clone[k] = deepClone(v, hash);
  }
  return clone;
}
