# React Pagination
Create a pagination controls component in a single file using React hooks. Do not include any CSS, classes, inline styles, or external libraries.

Requirements:
- Export interface `PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void; }`.
- Export a functional component named `Pagination` taking `PaginationProps`.
- Generate an array of page numbers from `1` to `totalPages`.
- Component returns a `<nav>` containing: a previous `<button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>Prev</button>`, a list of buttons for each page number with `key={page}`, `onClick={() => onPageChange(page)}`, and text `{page}`, and a next `<button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button>`.
