# React useDebounce Hook
Create a custom React hook that delays updating a value until a delay has elapsed in a single file.

Requirements:
- Export function `useDebounce<T>(value: T, delayMs: number): T`.
- Maintain state `debouncedValue: T` initialized to `value`.
- Inside `useEffect`, start a timer `setTimeout(() => setDebouncedValue(value), delayMs)`.
- Return cleanup function `() => clearTimeout(timer)` from `useEffect`.
- Return `debouncedValue`.
