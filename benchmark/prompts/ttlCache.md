# In-Memory TTL Cache
Create a generic in-memory key-value cache with time-to-live expiration in a single file without external dependencies.

Requirements:
- Export class `TtlCache<K, V>`.
- Internal storage: `Map<K, { value: V, expiresAt: number }>`.
- Constructor accepts optional `defaultTtlMs: number = 60_000`.
- Methods:
  - `set(key: K, value: V, ttlMs: number = this.defaultTtlMs): void`: stores entry with `Date.now() + ttlMs`.
  - `get(key: K): V | undefined`: returns value, or deletes entry and returns `undefined` if `Date.now() > expiresAt`.
  - `has(key: K): boolean`: returns `this.get(key) !== undefined`.
  - `prune(): number`: iterates all entries, deletes expired entries, and returns count of removed items.
  - Getter `size`: returns count of items currently in `Map`.
