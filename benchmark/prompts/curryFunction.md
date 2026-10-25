# Generic Function Curry
Create a generic curry utility in a single file without external libraries.

Requirements:
- Export function `curry(fn: (...args: any[]) => any): (...args: any[]) => any`.
- Curried wrapper checks accumulated arguments length against `fn.length`.
- If `args.length >= fn.length`, immediately returns `fn(...args)`.
- Otherwise returns a new function taking `(...nextArgs: any[])` that calls `curried(...args, ...nextArgs)`.
- At bottom: define `add3 = (a: number, b: number, c: number) => a + b + c`, curry it, and verify `curriedAdd(1)(2)(3) === 6` and `curriedAdd(1, 2)(3) === 6`.
