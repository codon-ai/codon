# Quick Sort
Create an in-place Quick Sort algorithm with Lomuto partitioning in a single file.

Requirements:
- Export function `quickSort<T>(arr: T[], compare?: (a: T, b: T) => number, left: number = 0, right: number = arr.length - 1): T[]`.
- Default comparator: `(a, b) => (a < b ? -1 : a > b ? 1 : 0)`.
- If `left < right`: choose pivot at `right`.
- Partition array in-place: maintain partition index `i = left`. Loop `j` from `left` to `right - 1`. If `compare(arr[j], pivot) < 0`, swap `arr[i]` with `arr[j]` and increment `i`.
- Swap `arr[i]` with pivot `arr[right]`.
- Recursively call `quickSort` on left subarray `(arr, compare, left, i - 1)` and right subarray `(arr, compare, i + 1, right)`.
- Return mutated `arr`.
