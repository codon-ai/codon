# Binary Search
Create an iterative binary search function in a single file without external libraries.

Requirements:
- Export function `binarySearch<T>(arr: T[], target: T, compare?: (a: T, b: T) => number): number`.
- Default comparator compares elements using `<` and `>`.
- Maintains pointers `low = 0` and `high = arr.length - 1`.
- In a loop while `low <= high`, computes `mid = Math.floor((low + high) / 2)`.
- If target matches `arr[mid]`, returns `mid`.
- If target is greater, updates `low = mid + 1`; if smaller, updates `high = mid - 1`.
- Returns `-1` if target is not found in the array.
