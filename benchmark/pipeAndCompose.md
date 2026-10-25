# Pipe and Compose Utilities
Create functional pipe and compose utilities in a single file.

Requirements:
- Export function `pipe<T>(...fns: Array<(arg: any) => any>): (initial: T) => any`.
- Execution flows left-to-right: `(initial) => fns.reduce((acc, fn) => fn(acc), initial)`.
- Export function `compose<T>(...fns: Array<(arg: any) => any>): (initial: T) => any`.
- Execution flows right-to-left: `(initial) => fns.reduceRight((acc, fn) => fn(acc), initial)`.
- At bottom: define `double = (x: number) => x * 2`, `inc = (x: number) => x + 1`. Demonstrate `pipe(double, inc)(5) === 11` and `compose(double, inc)(5) === 12`.
