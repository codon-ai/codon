# React Tabs
Create a tabbed content navigation component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `Tab { id: string; label: string; content: string; }`.
- Export interface `TabsProps { tabs: Tab[]; }`.
- Export a functional component named `Tabs` taking `TabsProps`.
- Maintain state `activeTabId: string` initialized to `tabs[0]?.id || ""`.
- Find the active tab object: `tabs.find((t) => t.id === activeTabId)`.
- Component returns an outer `<div>` containing: a `<nav>` element with `<button key={tab.id} onClick={() => setActiveTabId(tab.id)}>{tab.label}</button>` for each tab, and a `<div>` with `role="tabpanel"` rendering `{currentTab?.content}`.
