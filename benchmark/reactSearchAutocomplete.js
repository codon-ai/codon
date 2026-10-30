import React, { useState } from "react";
export function SearchAutocomplete({ items, onSelect }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const filtered = !query.trim() ? [] : items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  return (
    <div>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
        placeholder="Search..."
      />
      {isOpen && filtered.length > 0 && (
        <ul>
          {filtered.map(item => (
            <li key={item} onClick={() => { onSelect(item); setQuery(item); setIsOpen(false); }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
