export function unflattenObject(flat) {
  const result = {};

  for (const [fullKey, val] of Object.entries(flat)) {
    const keys = fullKey.split(".");
    let cur = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!cur[k] || typeof cur[k] !== "object") {
        cur[k] = {};
      }
      cur = cur[k];
    }

    cur[keys[keys.length - 1]] = val;
  }

  return result;
}
