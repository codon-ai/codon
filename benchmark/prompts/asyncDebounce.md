# Async Debounce Function
Create an async function debounce utility returning promises in a single file.

Requirements:
- Export function `asyncDebounce<T extends (...args: any[]) => Promise<any>>(fn: T, waitMs: number): (...args: Parameters<T>) => Promise<ReturnType<T>>`.
- Maintain `timer: NodeJS.Timeout | null = null`.
- Maintain `pendingResolvers: Array<{ resolve: (v: any) => void; reject: (e: any) => void; }> = []`.
- When returned function is invoked with `args`: create and return new `Promise`. Add `{ resolve, reject }` to `pendingResolvers`.
- Clear prior `timer`. Set new `timer = setTimeout(async () => { ... }, waitMs)`.
- When timer fires: execute `fn(...args)`. On success, resolve all pending promises with the result. On error, reject all with the error. Clear `pendingResolvers`.
