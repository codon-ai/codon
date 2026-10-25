# Codon Runtime Reference

`codon-runtime.ts` is a lightweight, zero-dependency library providing J-style array combinators, tacit trains, reductions, and array primitives for executing Codon idioms natively in JavaScript and TypeScript environments.

---

## Table of Contents

1. [Overview & Installation](#overview--installation)
2. [Combinators (Tacit Trains)](#combinators-tacit-trains)
   - [`fork(f, g, h)`](#forkf-g-h)
   - [`hook(f, g)`](#hookf-g)
   - [`atop(f, g)`](#atopf-g)
   - [`rank(fn, k)`](#rankfn-k)
3. [Folds, Scans & Math Verbs](#folds-scans--math-verbs)
   - [`fold(fn, target, init?)`](#foldfn-target-init)
   - [`scan(fn, target, init?)`](#scanfn-target-init)
   - [`sum(target)`](#sumtarget)
   - [`product(target)`](#producttarget)
   - [`div(a, b)`](#diva-b)
4. [Array Primitives](#array-primitives)
   - [`tally(target)`](#tallytarget)
   - [`shape(target)`](#shapetarget)
   - [`head(target)` & `tail(target)`](#headtarget--tailtarget)
   - [`behead(target)` & `curtail(target)`](#beheadtarget--curtailtarget)
   - [`take(n, target)` & `drop(n, target)`](#taken-target--dropn-target)
   - [`range(n)`](#rangen)
   - [`from(indices, target)`](#fromindices-target)
   - [`gradeUp(target)` & `gradeDown(target)`](#gradeuptarget--gradedowntarget)
   - [`box(val)` & `open(val)`](#boxval--openval)
5. [Usage Examples](#usage-examples)

---

## Overview & Installation

When Codon code using tacit trains or array verbs is compiled to JavaScript, the resulting output references functions from `codon-runtime.ts`.

### Importing in TypeScript / ES Modules:

```typescript
import {
    fork, hook, atop, rank,
    sum, product, tally, range,
    head, tail, behead, curtail,
    take, drop, from, gradeUp, gradeDown
} from "./codon-runtime";
```

The runtime contains **zero external dependencies** and works identically across Bun, Node.js, Deno, and modern web browsers.

---

## Combinators (Tacit Trains)

Combinators allow writing tacit (point-free) functions that operate without explicitly naming intermediate argument variables.

### `fork(f, g, h)`

Constructs a 3-function fork:
- **Monadic** (1 argument `y`): Computes `g(f(y), h(y))`
- **Dyadic** (2 arguments `x, y`): Computes `g(f(x, y), h(x, y))`

```typescript
import { fork, sum, tally } from "./codon-runtime";

const div = (a: number, b: number) => a / b;

// Average fork: sum(y) / tally(y)
const average = fork(sum, div, tally);

console.log(average([1, 2, 3, 4, 5])); // 3
console.log(average([10, 20, 30]));    // 20
```

### `hook(f, g)`

Constructs a 2-function hook:
- **Monadic** (1 argument `y`): Computes `f(y, g(y))`
- **Dyadic** (2 arguments `x, y`): Computes `f(x, g(y))`

```typescript
import { hook } from "./codon-runtime";

const add = (a: number, b: number) => a + b;
const double = (x: number) => x * 2;

// triple(y) = add(y, double(y)) = y + 2y = 3y
const triple = hook(add, double);

console.log(triple(5)); // 15
```

### `atop(f, g)`

Composes two functions, applying `g` to all arguments and feeding the single result into `f`:
```typescript
const addAndSquare = atop((x: number) => x * x, (a: number, b: number) => a + b);
console.log(addAndSquare(2, 3)); // (2 + 3)^2 = 25
```

### `rank(fn, k)`

Applies a function `fn` across arrays of specific dimensional rank `k` (default `k = 0` for recursive element-wise application).

---

## Folds, Scans & Math Verbs

### `fold(fn, target, init?)`
Reduces `target` array using binary function `fn`. If `init` is omitted, uses the first element as accumulator.

```typescript
import { fold } from "./codon-runtime";

const max = fold((a, b) => Math.max(a, b), [3, 9, 2, 7]);
console.log(max); // 9
```

### `scan(fn, target, init?)`
Produces an array of intermediate accumulator results (cumulative reduction):

```typescript
import { scan } from "./codon-runtime";

const runningSum = scan((a, b) => a + b, [1, 2, 3, 4]);
console.log(runningSum); // [1, 3, 6, 10]
```

### `sum(target)`
Computes the sum of a numeric array:
```typescript
import { sum } from "./codon-runtime";
console.log(sum([10, 20, 30])); // 60
```

### `product(target)`
Computes the product of a numeric array:
```typescript
import { product } from "./codon-runtime";
console.log(product([2, 3, 4])); // 24
```

### `div(a, b)`
Performs element-wise or scalar division supporting vector-scalar, scalar-vector, and vector-vector broadcasting:
```typescript
import { div } from "./codon-runtime";

console.log(div([10, 20, 30], 2));   // [5, 10, 15]
console.log(div(100, [2, 4, 5]));     // [50, 25, 20]
console.log(div([10, 20], [2, 5]));   // [5, 4]
```

---

## Array Primitives

### `tally(target)`
Returns the length of an array or string. Returns `0` for `null`/`undefined`, and `1` for scalar values:
```typescript
tally([1, 2, 3]); // 3
tally("hello");    // 5
tally(42);         // 1
```

### `shape(target)`
Returns an array of dimensional sizes for multi-dimensional nested arrays:
```typescript
shape([[1, 2, 3], [4, 5, 6]]); // [2, 3]
```

### `head(target)` & `tail(target)`
- `head`: Returns the first element of an array or string (`target[0]`).
- `tail`: Returns the last element (`target[target.length - 1]`).

### `behead(target)` & `curtail(target)`
- `behead`: Returns all elements except the first (`target.slice(1)`).
- `curtail`: Returns all elements except the last (`target.slice(0, -1)`).

### `take(n, target)` & `drop(n, target)`
- `take(n, target)`: Takes `n` elements from the beginning (if `n > 0`) or end (if `n < 0`).
- `drop(n, target)`: Drops `n` elements from the beginning (if `n > 0`) or end (if `n < 0`).

```typescript
const nums = [10, 20, 30, 40, 50];

take(2, nums);  // [10, 20]
take(-2, nums); // [40, 50]
drop(2, nums);  // [30, 40, 50]
drop(-2, nums); // [10, 20, 30]
```

### `range(n)`
Generates an array of integers from `0` to `n - 1`:
```typescript
range(5); // [0, 1, 2, 3, 4]
```

### `from(indices, target)`
Extracts elements at specific indices (supports negative indices relative to end):
```typescript
from(1, ["a", "b", "c"]);       // "b"
from(-1, ["a", "b", "c"]);      // "c"
from([0, 2], ["a", "b", "c"]);  // ["a", "c"]
```

### `gradeUp(target)` & `gradeDown(target)`
Returns the indices that would sort the array in ascending (`gradeUp`) or descending (`gradeDown`) order (indirect sorting):
```typescript
const vals = [30, 10, 20];
const sortedIndices = gradeUp(vals); // [1, 2, 0] (since vals[1]=10, vals[2]=20, vals[0]=30)

// Sort original array using from:
from(sortedIndices, vals); // [10, 20, 30]
```

### `box(val)` & `open(val)`
Wraps a value in a boxed container (`box`) or unboxes it (`open`), mirroring J's `<` (box) and `>` (open) verbs for heterogeneous structures.

---

## Usage Examples

### Implementing Statistics in Point-Free Style

```typescript
import { fork, sum, tally, gradeUp, from } from "./codon-runtime";

const div = (a: number, b: number) => a / b;

// Average calculation
const mean = fork(sum, div, tally);

// Median calculation
const median = (arr: number[]) => {
    const sorted = from(gradeUp(arr), arr);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
};

const data = [12, 5, 23, 18, 9, 44, 31];
console.log("Mean:", mean(data));     // 20.285...
console.log("Median:", median(data)); // 18
```
