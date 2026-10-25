import React, { useRef, useEffect } from "react";

export function InfiniteList({ items, onLoadMore, hasMore }) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    });

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <div>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <div ref={sentinelRef}>
        {hasMore ? "Loading more..." : "No more items"}
      </div>
    </div>
  );
}
