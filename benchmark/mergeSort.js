export function mergeSort(arr, compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
  if (arr.length <= 1) return [...arr];
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid), compare);
  const right = mergeSort(arr.slice(mid), compare);
  function merge(l, r) {
    const res = [];
    let i = 0, j = 0;
    while (i < l.length && j < r.length) {
      if (compare(l[i], r[j]) <= 0) res.push(l[i++]);
      else res.push(r[j++]);
    }
    return res.concat(l.slice(i)).concat(r.slice(j));
  }
  return merge(left, right);
}
