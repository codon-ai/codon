export function deepEqual(a, b) {
  if (Object.is(a, b)) {
    return true;
  }
  if (a === null || typeof a !== "object" || b === null || typeof b !== "object") {
    return false;
  }
  if (a.constructor !== b.constructor) {
    return false;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString();
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}
