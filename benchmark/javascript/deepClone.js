export function deepClone(val, hash) {
  if (hash === undefined) {
    hash = new WeakMap();
  }
  if (val === null || typeof val !== "object") {
    return val;
  }
  if (val.constructor === Date) {
    return new Date(val.getTime());
  }
  if (val.constructor === RegExp) {
    return new RegExp(val.source, val.flags);
  }
  if (hash.has(val)) {
    return hash.get(val);
  }
  if (Array.isArray(val)) {
    const arr = [];
    hash.set(val, arr);
    for (const item of val) {
      arr.push(deepClone(item, hash));
    }
    return arr;
  }
  const clone = Object.create(Object.getPrototypeOf(val));
  hash.set(val, clone);
  for (const [key, value] of Object.entries(val)) {
    clone[key] = deepClone(value, hash);
  }
  return clone;
}
