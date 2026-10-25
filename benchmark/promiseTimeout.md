# Promise Timeout Wrapper
Create a Promise timeout wrapper using Promise.race in a single file.

Requirements:
- Export function `withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string = "Operation timed out"): Promise<T>`.
- Create timeout promise: `new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs); promise.finally(() => clearTimeout(timer)); })`.
- Return `Promise.race([promise, timeoutPromise])`.
