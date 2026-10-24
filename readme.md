# Codon

A bidirectional compiler and translator that converts between Codon (`.cdn`) and JavaScript/React (`ESTree` / Babel AST).

This project uses an Abstract Syntax Tree (AST) approach to guarantee structural accuracy during round-trip translations, leveraging `@babel/generator` for robust JavaScript emission.

## Features

- **Bidirectional Compilation**: Compile `.cdn` files to `.js` and translate `.js` files to `.cdn` with round-trip fidelity.
- **Codon Array Strengths Translated to JS**:
  - Tacit Trains: Forks `(fork f g h)` / `(f g h)` and Hooks `(hook f g)` / `(f g)`
  - Folds & Scans: Sum reduction `+/`, product reduction `*/`, scans `+\`, `fold`, `scan`
  - Array Primitives: `tally`, `range`, `head`, `tail`, `behead`, `curtail`, `take`, `drop`, `from`, `gradeUp`, `gradeDown`
  - Compact Direct Definition Functions (`{{ ... }}`) with parameters & default arguments
  - Full Codon Control Structures: `if. / elseif. / else. / end.`, `for_of.`, `for_in.`, `for.`, `while.`, `whilst.`, `try. / catch. / finally.`, `select. / case.`, `throw.`, `return.`
- **Modern JavaScript Expressed in Codon**:
  - ES6 Classes: `class. Name [extends Super] do. ... end.`, fields, constructors with defaults, methods, async methods, getters, setters
  - Object & Array Destructuring: `[a, b, ...rest] =: list`, `{a, b: alias, c = default} =: obj`
  - Object & Array Spread: `O('...'; obj; 'prop'; val)`, `[...a, ...b]`
  - Optional Chaining: `obj?.prop`, `obj?.[key]`, `fn?.(args)`
  - Async / Await & Promises
  - Node Packages & Modules: ES Module imports/exports, namespaced imports, `require`
  - React & JSX support
- **Lightweight Zero-Dependency Runtime (`codon-runtime.ts`)**:
  - Implements Codon combinators (`fork`, `hook`, `atop`, `rank`) and array verbs for running Codon idioms natively in JavaScript environments.

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js / `ts-node`)
- Dependencies: `@babel/parser`, `@babel/generator`, `@babel/types`

```bash
bun install
```

## Usage

### Compile Codon to JavaScript (`compile`)

Converts a `.cdn` file into standard JavaScript:

```bash
bun run cli.ts compile path/to/file.cdn
```

_Output: Generates `path/to/file.js` in the same directory._

### Translate JavaScript to Codon (`translate`)

Parses a `.js` (or `.jsx`) file and emits Codon notation:

```bash
bun run cli.ts translate path/to/file.js
```

_Output: Generates `path/to/file.cdn` in the same directory._

### Verify Benchmark Suite (`verify`)

Runs round-trip verification (`JS ➔ Codon ➔ JS ➔ Babel AST Validation`) on all 11 benchmark suites:

```bash
bun run cli.ts verify
```

### Run Unit Tests

```bash
bun test
```

## Architecture

The project is split into modular components:

- **`cli.ts`**: The command-line entry point. Handles file I/O, argument parsing, single-file compilation/translation, and benchmark suite verification.
- **`codon-parser.ts`**: Recursive-descent parser that tokenizes and parses Codon notation, control structures, tacit trains, classes, and pattern destructuring into an ESTree-compatible Abstract Syntax Tree.
- **`transpilers.ts`**:
  - `JSToCodonTranslator`: Walks modern JavaScript/JSX AST and emits concise, expressive Codon notation.
  - `CodonToJSCompiler`: Converts generated AST into normalized Babel AST nodes, mapping tacit trains and Codon verbs, then uses `@babel/generator` to safely emit formatted JavaScript.
- **`types.ts`**: Comprehensive TypeScript definitions for all supported AST nodes.
- **`codon-runtime.ts`**: Zero-dependency library of combinators and array primitives supporting Codon semantics in JavaScript.
- **`benchmark/`**: 11 realistic benchmark suites spanning backend servers, async task queues, reactive state machines, test runners, CLI scanners, and React apps in both JS and Codon (`benchmark/codon/`).

## License

MIT
