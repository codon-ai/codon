import React, { useState } from "react";
export function StarRating({ totalStars = 5, value, onChange }) {
  const [hoverValue, setHoverValue] = useState(null);
  const stars = Array.from({ length: totalStars }, (_, i) => i + 1);
  return (
    <div>
      {stars.map(star => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
        >
          {(hoverValue ?? value) >= star ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
