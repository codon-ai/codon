# React usePrevious Hook
Create a custom React hook that tracks and returns the previous value of a prop or state variable in a single file.

Requirements:
- Export function `usePrevious<T>(value: T): T | undefined`.
- Maintain a ref `ref = useRef<T | undefined>(undefined)`.
- Inside `useEffect`, update `ref.current = value`.
- Return `ref.current` (which holds the value from the prior render before the effect updated it).
