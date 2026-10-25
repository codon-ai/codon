# React Search Autocomplete
Create an autocomplete search input component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `SearchAutocompleteProps { items: string[]; onSelect: (item: string) => void; }`.
- Export a functional component named `SearchAutocomplete` taking `SearchAutocompleteProps`.
- Maintain state `query: string` initialized to `""`.
- Maintain state `isOpen: boolean` initialized to `false`.
- Compute filtered suggestions: if `query.trim() === ""` return empty array; else filter `items.filter((item) => item.toLowerCase().includes(query.toLowerCase()))`.
- Component returns an outer `<div>` containing: an `<input value={query} onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }} placeholder="Search..." />`, and if `isOpen && filtered.length > 0`, a `<ul>` mapping filtered items to `<li key={item} onClick={() => { onSelect(item); setQuery(item); setIsOpen(false); }}>{item}</li>`.
