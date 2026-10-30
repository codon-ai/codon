export function unflattenObject(flat) {
  const result = {};
  for (const [fullKey, value] of Object.entries(flat)) {
    const keys = fullKey.split(".");
    let curr = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in curr) || typeof curr[k] !== "object") curr[k] = {};
      curr = curr[k];
    }
    curr[keys[keys.length - 1]] = value;
  }
  return result;
}
