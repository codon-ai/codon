export function quickSort(arr, compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0), left = 0, right = arr.length - 1) {
  if (left < right) {
    const pivot = arr[right];
    let i = left;
    for (let j = left; j < right; j++) {
      if (compare(arr[j], pivot) < 0) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        i++;
      }
    }
    [arr[i], arr[right]] = [arr[right], arr[i]];
    quickSort(arr, compare, left, i - 1);
    quickSort(arr, compare, i + 1, right);
  }
  return arr;
}
