export function matrixAdd(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) throw new Error("Matrix dimension mismatch");
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}
export function matrixScalarMultiply(m, scalar) {
  return m.map(row => row.map(val => val * scalar));
}
export function matrixMultiply(a, b) {
  if (a[0].length !== b.length) throw new Error("Incompatible matrix dimensions for multiplication");
  const m = a.length, k = b.length, n = b[0].length;
  const res = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let p = 0; p < k; p++) sum += a[i][p] * b[p][j];
      res[i][j] = sum;
    }
  }
  return res;
}
