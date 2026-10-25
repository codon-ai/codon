# LRU Cache
Create an in-memory Least Recently Used (LRU) Cache in a single file without external libraries.

Requirements:
- Export class `LruCache<K, V>`.
- Constructor accepts `capacity: number`. If `capacity <= 0`, throw `new Error("Capacity must be greater than 0")`.
- Internal store uses `Map<K, V>` exploiting JavaScript Map key insertion ordering.
- Method `get(key: K): V | undefined`: if key exists, delete and re-insert it so it becomes most recently used, and return value; otherwise return `undefined`.
- Method `put(key: K, value: V): void`: if key exists, delete it first; if `map.size >= capacity`, delete the oldest key (`map.keys().next().value`); then insert `key, value`.
- Method `has(key: K): boolean`: returns `this.map.has(key)` without altering access order.
- Getter `size: number`: returns current entry count.
