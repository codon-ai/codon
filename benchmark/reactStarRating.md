# React Star Rating
Create an interactive star rating component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `StarRatingProps { totalStars?: number; value: number; onChange: (rating: number) => void; }`.
- Export a functional component named `StarRating` taking `StarRatingProps` with default `totalStars = 5`.
- Maintain state `hoverValue: number | null` initialized to `null`.
- Component returns an outer `<div>` mapping integers `1` through `totalStars`.
- Each star is a `<button>` with `key={star}`, `onClick={() => onChange(star)}`, `onMouseEnter={() => setHoverValue(star)}`, `onMouseLeave={() => setHoverValue(null)}`, and text `(hoverValue ?? value) >= star ? "★" : "☆"`.
