# Deep Equality Comparator
Create a recursive deep equality comparator in a single file without external libraries.

Requirements:
- Export function `deepEqual(a: any, b: any): boolean`.
- If `a === b`, return `true` (including `NaN === NaN` check via `Object.is(a, b)`).
- If either is null or not of type `"object"`, return `false`.
- If constructor or prototype differs, return `false`.
- If `a instanceof Date && b instanceof Date`, return `a.getTime() === b.getTime()`.
- If `a instanceof RegExp && b instanceof RegExp`, return `a.toString() === b.toString()`.
- Compare keys: `keysA = Object.keys(a)`, `keysB = Object.keys(b)`. If `keysA.length !== keysB.length`, return `false`.
- Iterate `keysA`: if `!Object.prototype.hasOwnProperty.call(b, key)` or `!deepEqual(a[key], b[key])`, return `false`.
- Return `true` if all keys match.
