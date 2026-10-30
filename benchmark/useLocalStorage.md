# React useLocalStorage Hook
Create a custom React hook to synchronize state with window.localStorage in a single file.

Requirements:
- Export function `useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void]`.
- Initialize state from `window.localStorage.getItem(key)` parsed with `JSON.parse`. If null or parse throws an error, return `initialValue`.
- Exported setter callback updates internal state and stores `JSON.stringify(newValue)` into `window.localStorage.setItem(key, ...)`.
- Wrap localStorage access in `try / catch` to handle storage quota or private browsing errors gracefully, logging `console.error`.
- Return a tuple `[storedValue, setValue]`.
