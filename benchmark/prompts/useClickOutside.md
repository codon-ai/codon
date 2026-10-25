# React useClickOutside Hook
Create a custom React hook that calls a callback when clicking outside a referenced DOM element in a single file.

Requirements:
- Export function `useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void): void`.
- Inside `useEffect`, define a listener function `(event: MouseEvent | TouchEvent) => { if (!ref.current || ref.current.contains(event.target as Node)) return; handler(event); }`.
- Add event listeners to `document` for `"mousedown"` and `"touchstart"`.
- Return cleanup function removing both listeners from `document`.
