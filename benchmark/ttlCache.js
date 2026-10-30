export class TtlCache {
  constructor(defaultTtlMs = 60000) {
    this.defaultTtlMs = defaultTtlMs;
    this.map = new Map();
  }
  get size() { return this.map.size; }
  set(key, value, ttlMs = this.defaultTtlMs) {
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  get(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return entry.value;
  }
  has(key) {
    return this.get(key) !== undefined;
  }
  prune() {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.map.entries()) {
      if (now > entry.expiresAt) {
        this.map.delete(key);
        count++;
      }
    }
    return count;
  }
}
