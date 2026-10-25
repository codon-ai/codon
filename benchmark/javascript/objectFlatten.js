export function flattenObject(obj, prefix = "") {
  const result = {};

  for (const k of Object.keys(obj)) {
    const keyName = prefix ? `${prefix}.${k}` : k;
    const val = obj[k];

    if (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      !(val instanceof Date) &&
      Object.keys(val).length > 0
    ) {
      Object.assign(result, flattenObject(val, keyName));
    } else {
      result[keyName] = val;
    }
  }

  return result;
}
