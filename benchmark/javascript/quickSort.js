export function quickSort(arr, compare, left, right) {
  if (compare === undefined) {
    compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  }
  if (left === undefined) {
    left = 0;
  }
  if (right === undefined) {
    right = arr.length - 1;
  }

  if (left < right) {
    const pivot = arr[right];
    let i = left;
    for (let j = left; j < right; j++) {
      if (compare(arr[j], pivot) < 0) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        i++;
      }
    }
    const tmp = arr[i];
    arr[i] = arr[right];
    arr[right] = tmp;

    quickSort(arr, compare, left, i - 1);
    quickSort(arr, compare, i + 1, right);
  }
  return arr;
}
