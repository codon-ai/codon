# Function Throttle Utility
Create a trailing-edge throttle utility limiting call rates in a single file.

Requirements:
- Export function `throttle<T extends (...args: any[]) => any>(fn: T, limitMs: number): (...args: Parameters<T>) => void`.
- Maintain `inThrottle: boolean = false`.
- Maintain `lastArgs: Parameters<T> | null = null`.
- When called: if not `inThrottle`, invoke `fn(...args)`, set `inThrottle = true`, and start `setTimeout` for `limitMs`.
- If called while `inThrottle`, save `lastArgs = args`.
- When timer expires: if `lastArgs` exists, invoke `fn(...lastArgs)`, reset `lastArgs = null`, and restart timer; otherwise set `inThrottle = false`.
