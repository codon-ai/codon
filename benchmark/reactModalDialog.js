import React, { useEffect } from "react";
export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div onClick={onClose}>
      <div onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <div>{children}</div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
