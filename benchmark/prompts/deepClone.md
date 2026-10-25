# Deep Clone Utility
Create a recursive deep cloning function supporting objects, arrays, and Dates in a single file without JSON serialization.

Requirements:
- Export function `deepClone<T>(val: T, hash = new WeakMap()): T`.
- If `val === null` or `typeof val !== "object"`, return `val` immediately.
- If `val instanceof Date`, return `new Date(val.getTime()) as any`.
- If `val instanceof RegExp`, return `new RegExp(val.source, val.flags) as any`.
- If `hash.has(val)`, return cached cloned reference `hash.get(val)` (handling circular references).
- If `Array.isArray(val)`, clone array items recursively.
- If plain object, create new object with `Object.create(Object.getPrototypeOf(val))`, register in `hash`, and recursively clone each own property with `Object.entries`.
- Return cloned object.
