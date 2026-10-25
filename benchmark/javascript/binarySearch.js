export function binarySearch(arr, target, compare) {
  const cmp = compare || ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const res = cmp(arr[mid], target);
    if (res === 0) {
      return mid;
    }
    if (res < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
