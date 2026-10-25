# React Dropdown Menu
Create a custom select dropdown menu component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `DropdownProps { options: string[]; selected: string; onSelect: (val: string) => void; }`.
- Export a functional component named `Dropdown` taking `DropdownProps`.
- Maintain state `isOpen: boolean` initialized to `false`.
- Maintain ref `containerRef = useRef<HTMLDivElement>(null)`.
- Attach a `mousedown` listener to `document` in `useEffect`: if click target is outside `containerRef.current`, call `setIsOpen(false)`. Clean up on unmount.
- Component returns an outer `<div ref={containerRef}>` containing: a toggle `<button onClick={() => setIsOpen(!isOpen)}>{selected || "Select an option"}</button>`, and if `isOpen`, a `<ul>` mapping `options` to `<li key={opt} onClick={() => { onSelect(opt); setIsOpen(false); }}>{opt}</li>`.
