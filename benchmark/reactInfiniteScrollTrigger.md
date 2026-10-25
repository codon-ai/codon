# React Infinite Scroll Trigger
Create a list component with an intersection observer sentinel for infinite scrolling in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `InfiniteListProps { items: string[]; onLoadMore: () => void; hasMore: boolean; }`.
- Export a functional component named `InfiniteList` taking `InfiniteListProps`.
- Maintain ref `sentinelRef = useRef<HTMLDivElement>(null)`.
- Inside `useEffect`, create `new IntersectionObserver((entries) => { if (entries[0].isIntersecting && hasMore) onLoadMore(); })`.
- Observe `sentinelRef.current` if present. Clean up observer by calling `observer.disconnect()` on unmount or dependency change.
- Component returns an outer `<div>` containing: a `<ul>` mapping `items` to `<li key={idx}>{item}</li>`, and a sentinel `<div ref={sentinelRef}>{hasMore ? "Loading more..." : "No more items"}</div>`.
