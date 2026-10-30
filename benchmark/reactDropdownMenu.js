import React, { useState, useRef, useEffect } from "react";
export function Dropdown({ options, selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    const handleMouseDown = e => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);
  return (
    <div ref={containerRef}>
      <button onClick={() => setIsOpen(!isOpen)}>{selected || "Select an option"}</button>
      {isOpen && (
        <ul>
          {options.map(opt => (
            <li key={opt} onClick={() => { onSelect(opt); setIsOpen(false); }}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
