# React useInterval Hook
Create a declarative React useInterval hook that supports pause and dynamic delays in a single file.

Requirements:
- Export function `useInterval(callback: () => void, delayMs: number | null): void`.
- Maintain a ref `savedCallback = useRef<() => void>(callback)`.
- Inside a `useEffect`, update `savedCallback.current = callback` whenever `callback` changes.
- Inside a second `useEffect`, if `delayMs !== null`, establish `setInterval(() => savedCallback.current(), delayMs)`.
- Return cleanup function `() => clearInterval(id)`.
