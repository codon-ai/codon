# 2D Matrix Math Operations
Create 2D matrix addition, scalar multiplication, and matrix multiplication functions in a single file.

Requirements:
- Type `Matrix = number[][]`.
- Export function `matrixAdd(a: Matrix, b: Matrix): Matrix`: throws `new Error("Matrix dimension mismatch")` if rows or cols differ. Returns element-wise sum.
- Export function `matrixScalarMultiply(m: Matrix, scalar: number): Matrix`: returns new matrix with every element multiplied by scalar.
- Export function `matrixMultiply(a: Matrix, b: Matrix): Matrix`: let `a` be `m x k` and `b` be `k x n`. Throws `new Error("Incompatible matrix dimensions for multiplication")` if `a[0].length !== b.length`. Computes dot products for each cell `[i][j]`. Returns resulting `m x n` matrix.
