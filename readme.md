# J ↔ JS Transpiler

A bidirectional transpiler that converts JavaScript/React (ESTree/Babel AST) into `J` notation, and parses `J` notation back into executable JavaScript.

This project uses an Abstract Syntax Tree (AST) approach to guarantee structural accuracy during round-trip translations, leveraging `@babel/generator` for robust JavaScript emission.

## Features

- **Bidirectional Compilation**: Convert `.j` files to `.js` and vice versa with round-trip fidelity.
- **J Array Strengths Translated to JS**:
  - Tacit Trains: Forks `(fork f g h)` / `(f g h)` and Hooks `(hook f g)` / `(f g)`
  - Folds & Scans: Sum reduction `+/`, product reduction `*/`, scans `+\`, `fold`, `scan`
  - Array Primitives: `tally`, `range`, `head`, `tail`, `behead`, `curtail`, `take`, `drop`, `from`, `gradeUp`, `gradeDown`
  - Compact Direct Definition Functions (`{{ ... }}`) with parameters & default arguments
  - Full J Control Structures: `if. / elseif. / else. / end.`, `for_of.`, `for_in.`, `for.`, `while.`, `whilst.`, `try. / catch. / finally.`, `select. / case.`, `throw.`, `return.`
- **Modern JavaScript Expressed in J**:
  - ES6 Classes: `class. Name [extends Super] do. ... end.`, fields, constructors with defaults, methods, async methods, getters, setters
  - Object & Array Destructuring: `[a, b, ...rest] =: list`, `{a, b: alias, c = default} =: obj`
  - Object & Array Spread: `O('...'; obj; 'prop'; val)`, `[...a, ...b]`
  - Optional Chaining: `obj?.prop`, `obj?.[key]`, `fn?.(args)`
  - Async / Await & Promises
  - Node Packages & Modules: ES Module imports/exports, namespaced imports, `require`
  - React & JSX support
- **Lightweight Zero-Dependency Runtime (`j-runtime.ts`)**:
  - Implements J combinators (`fork`, `hook`, `atop`, `rank`) and array verbs for running J idioms natively in JavaScript environments.

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js / `ts-node`)
- Dependencies: `@babel/parser`, `@babel/generator`, `@babel/types`

```bash
bun install
```

## Usage

### Transpile J to JavaScript (`j2js`)

Converts a `.j` file into standard JavaScript:

```bash
bun run cli.ts j2js path/to/file.j
```

_Output: Generates `path/to/file.js` in the same directory._

### Transpile JavaScript to J (`js2j`)

Parses a `.js` (or `.jsx`) file and emits `J` notation:

```bash
bun run cli.ts js2j path/to/file.js
```

_Output: Generates `path/to/file.j` in the same directory._

### Verify Benchmark Suite (`verify`)

Runs round-trip transpilation (`JS ➔ J ➔ JS ➔ Babel AST Validation`) on all 11 benchmark suites:

```bash
bun run cli.ts verify
```

### Run Unit Tests

```bash
bun test
```

## Architecture

The project is split into modular components:

- **`cli.ts`**: The command-line entry point. Handles file I/O, argument parsing, single-file transpilation, and benchmark suite verification.
- **`j-parser.ts`**: Recursive-descent parser that tokenizes and parses `J` notation, control structures, tacit trains, classes, and pattern destructuring into an ESTree-compatible Abstract Syntax Tree.
- **`transpilers.ts`**:
  - `JSToJTranspiler`: Walks modern JavaScript/JSX AST and emits concise, expressive `J` notation.
  - `JToJSTranspiler`: Converts generated AST into normalized Babel AST nodes, mapping tacit trains and J verbs, then uses `@babel/generator` to safely emit formatted JavaScript.
- **`types.ts`**: Comprehensive TypeScript definitions for all supported AST nodes.
- **`j-runtime.ts`**: Zero-dependency library of combinators and array primitives supporting J semantics in JavaScript.
- **`benchmark/`**: 11 realistic benchmark suites spanning backend servers, async task queues, reactive state machines, test runners, CLI scanners, and React apps in both JS and J.

## License

MIT
