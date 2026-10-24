# Mini Unit Test Runner
Create a minimal unit testing and assertion utility in a single file.

Requirements:
- Export function `expect<T>(actual: T)` returning:
  - `toBe(expected: T)`: throws `new Error(\`Expected \${expected}, but received \${actual}\`)` if `actual !== expected`.
  - `toEqual(expected: T)`: compares `JSON.stringify(actual)` and `JSON.stringify(expected)`, throwing if mismatched.
- Class `TestSuite`:
  - Registers tests via `test(name: string, fn: () => void | Promise<void>)`.
  - Async method `run(): Promise<Array<{ name: string, passed: boolean, error?: unknown }>>`: executes registered tests sequentially, catching errors and tracking pass/fail.
- Export instance `const suite = new TestSuite()`.
- At the bottom, register one sync passing test (`1 + 1 == 2`) and one async passing test (`Promise.resolve("hello")`), run the suite, and log `✓ PASS: <name>` or `✗ FAIL: <name>`.
