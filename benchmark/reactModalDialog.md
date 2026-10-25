# React Modal Dialog
Create an accessible controlled modal dialog component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }`.
- Export a functional component named `Modal` taking `ModalProps`.
- If `!isOpen`, the component immediately returns `null`.
- When open, attach a `keydown` listener on `window` in `useEffect` that calls `onClose()` if `e.key === "Escape"`. Clean up listener on unmount or when closed.
- Component returns an outer overlay `<div>` with `onClick={onClose}`.
- Inside the overlay, render a content container `<div>` with `onClick={(e) => e.stopPropagation()}` to prevent backdrop click closing.
- Inside the content container, render: `<h3>{title}</h3>`, `<div>{children}</div>`, and `<button onClick={onClose}>Close</button>`.
