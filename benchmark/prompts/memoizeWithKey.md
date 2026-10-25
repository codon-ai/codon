# Memoize Function with Custom Resolver
Create a function memoizer with customizable cache key resolvers in a single file.

Requirements:
- Export function `memoize<T extends (...args: any[]) => any>(fn: T, keyResolver?: (...args: Parameters<T>) => string): T & { cache: Map<string, ReturnType<T>>; clear: () => void; }`.
- Internal cache using `Map<string, ReturnType<T>>()`.
- Key resolver defaults to `(...args) => JSON.stringify(args)`.
- When called: generate key using resolver. If key exists in cache, return cached value.
- Otherwise compute `result = fn(...args)`, store in cache, and return `result`.
- Attach `memoized.cache = cache` and `memoized.clear = () => cache.clear()`.
- Return memoized function.
