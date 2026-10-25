export function matrixAdd(a, b) {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error("Matrix dimension mismatch");
  }
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function matrixScalarMultiply(m, scalar) {
  return m.map((row) => row.map((val) => val * scalar));
}

export function matrixMultiply(a, b) {
  if (a[0].length !== b.length) {
    throw new Error("Incompatible matrix dimensions for multiplication");
  }
  const rowsA = a.length;
  const colsA = a[0].length;
  const colsB = b[0].length;
  const result = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }

  return result;
}
