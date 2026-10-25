# Async Operation Retry with Exponential Backoff
Create an async retry utility with exponential backoff in a single file.

Requirements:
- Export interface `RetryOptions { maxRetries: number; baseDelayMs: number; backoffFactor?: number; }`.
- Export async function `retry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T>`.
- Default `backoffFactor = 2`.
- Execute `fn()`. If resolved, return result.
- If rejected and attempts < `maxRetries`: wait for delay `options.baseDelayMs * Math.pow(backoffFactor, attempt)` using `new Promise((res) => setTimeout(res, delay))`.
- If attempts exceed `maxRetries`, rethrow final error.
