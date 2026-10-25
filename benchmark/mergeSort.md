# Merge Sort
Create a pure recursive merge sort algorithm in a single file without external libraries.

Requirements:
- Export function `mergeSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[]`.
- Default comparator: `(a, b) => (a < b ? -1 : a > b ? 1 : 0)`.
- Base case: if `arr.length <= 1`, return copy of `arr`.
- Compute `mid = Math.floor(arr.length / 2)`.
- Recursively sort `left = mergeSort(arr.slice(0, mid))` and `right = mergeSort(arr.slice(mid))`.
- Helper function `merge(left: T[], right: T[]): T[]` merges two sorted arrays into a new sorted array using two pointers.
- Return merged result without mutating input array.
