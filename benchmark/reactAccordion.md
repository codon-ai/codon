# React Accordion
Create a single-open collapsible accordion component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `AccordionItem { id: string; title: string; content: string; }`.
- Export interface `AccordionProps { items: AccordionItem[]; }`.
- Export a functional component named `Accordion` taking `AccordionProps`.
- Maintain state `openId: string | null` initialized to `null`.
- Toggle handler `toggleItem(id: string)`: if `openId === id`, set `openId` to `null`; otherwise set `openId` to `id`.
- Component returns an outer `<div>` mapping over `items`.
- Each item renders a container `<div>` with `key={item.id}` containing a `<button onClick={() => toggleItem(item.id)}>{item.title}</button>`, and conditionally renders `{openId === item.id && <div>{item.content}</div>}`.
