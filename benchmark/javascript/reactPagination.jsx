import React from "react";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav>
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      {pages.map((page) => (
        <button key={page} onClick={() => onPageChange(page)}>
          {page}
        </button>
      ))}
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}
