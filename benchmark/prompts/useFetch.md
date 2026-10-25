# React useFetch Hook
Create a custom React hook that executes an async fetch request with abort handling in a single file.

Requirements:
- Export interface `FetchState<T> { data: T | null; error: Error | null; loading: boolean; }`.
- Export function `useFetch<T>(url: string): FetchState<T>`.
- Maintain state `data: T | null = null`, `error: Error | null = null`, and `loading: boolean = true`.
- Inside `useEffect`, create `new AbortController()`. Fetch `url` with `{ signal: controller.signal }`.
- On successful json parse, set `data` and set `error = null`. On error, if `err.name !== "AbortError"`, set `error = err` and `data = null`.
- In `finally`, set `loading = false`. Clean up by calling `controller.abort()`.
- Return `{ data, error, loading }`.
