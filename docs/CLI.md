# Codon Command-Line Interface (CLI) Manual

The Codon CLI provides tools to compile Codon files (`.cdn`) into standard JavaScript (`.js`), translate existing JavaScript/React files (`.js`, `.jsx`) into concise Codon notation with automatic macro compaction, and verify compilation fidelity.

---

## Table of Contents

1. [Installation & Requirements](#installation--requirements)
2. [CLI Commands](#cli-commands)
   - [`compile`: Codon ➔ JavaScript](#compile-codon--javascript)
   - [`translate`: JavaScript ➔ Codon](#translate-javascript--codon)
   - [`verify`: Benchmark Verification](#verify-benchmark-verification)
3. [NPM / Bun Script Shortcuts](#npm--bun-script-shortcuts)
4. [File Extension Conventions](#file-extension-conventions)
5. [Error Diagnostics & Troubleshooting](#error-diagnostics--troubleshooting)

---

## Installation & Requirements

The CLI runs directly with [Bun](https://bun.sh/) (or Node.js with TypeScript loaders).

Ensure dependencies are installed:
```bash
bun install
```

The CLI entrypoint is `index.ts`.

---

## CLI Commands

### `compile`: Codon ➔ JavaScript

Converts a Codon (`.cdn`) source file into standard, executable JavaScript.

```bash
bun run index.ts compile <path-to-file.cdn>
```

#### What Happens:
1. Reads the source code from `<path-to-file.cdn>`.
2. Parses the source into an Abstract Syntax Tree via `CodonToASTParser`.
3. Detects any macro invocations (`M!name(...)` or `M!name()`), looks up their definitions in `dict.json`, and expands them directly into standard AST subtrees.
4. Normalizes tacit trains, folds, scans, and monadic verbs.
5. Emits formatted JavaScript via `@babel/generator`.
6. Saves the generated file as `<path-to-file.js>` in the same directory.

#### Example:
```bash
bun run index.ts compile src/math.cdn
```
Output:
```
✅ Successfully compiled src/math.cdn to JS -> src/math.js
```

---

### `translate`: JavaScript ➔ Codon

Parses an existing JavaScript (`.js`) or React JSX (`.jsx`) file and emits expressive Codon notation.

```bash
bun run index.ts translate <path-to-file.js>
```

#### What Happens:
1. Reads `<path-to-file.js>`.
2. Parses the code into a Babel AST with ES module, JSX, and modern syntax plugins enabled.
3. Constructs a lexical scope graph via `resolveScopes` in `macro-dict.ts`.
4. Evaluates each AST subtree against `dict.json`. When a matching Level-2 clone is detected, it extracts argument bindings and emits compact `M!name(args)` macro invocations.
5. Translates standard JS constructs (classes, async/await, arrow functions, destructuring, and object literals) into concise Codon notation.
6. Saves the generated file as `<path-to-file.cdn>` in the same directory.

#### Example:
```bash
bun run index.ts translate src/server.js
```
Output:
```
✅ Successfully translated src/server.js to Codon -> src/server.cdn
```

---

### `verify`: Benchmark Verification

Executes round-trip verification (`JS ➔ Codon ➔ JS ➔ Babel AST Validation`) across benchmark suites to guarantee 100% syntactic and structural fidelity.

```bash
bun run index.ts verify
```

#### Verification Pipeline:
- **Step 1**: JS is translated to Codon with automatic macro compaction.
- **Step 2**: Generated Codon is compiled back to JavaScript with macro expansion.
- **Step 3**: Roundtripped JavaScript is parsed with `@babel/parser` to ensure syntax validity.

---

## NPM / Bun Script Shortcuts

For convenience, `package.json` defines shortcuts for the core CLI commands:

```bash
# Compile
bun run compile path/to/file.cdn

# Translate
bun run translate path/to/file.js

# Verify
bun run verify

# Run unit tests
bun test
```

---

## File Extension Conventions

| Extension | Language | Notes |
| :--- | :--- | :--- |
| `.cdn` | **Codon Source** | Input to `compile`, output from `translate`. |
| `.js` | **JavaScript Source** | Input to `translate`, output from `compile`. |
| `.jsx` | **React JSX Source** | Supported by `translate`. |

When compiling, if the input file ends with `.cdn`, the `.cdn` extension is replaced with `.js`. If it does not end with `.cdn`, `.js` is appended.

When translating, `.js` or `.jsx` is automatically replaced with `.cdn`.

---

## Error Diagnostics & Troubleshooting

When compilation or translation encounters an issue, the CLI prints informative error messages with source location information:

### Unknown Macro Invocation
```
❌ Operation failed for src/app.cdn:
Unknown macro: m_nonexistent_123
```
*Resolution*: Verify the macro name against `dict.json` or consult the [Macros Catalog](MACROS.md).

### Syntax Error in Codon Source
```
❌ Operation failed for src/bad.cdn:
Error at line 14, col 8: Unexpected token
```
*Resolution*: Check the line and column reported for mismatched block terminators (`end.`, `}}`) or malformed expressions. Consult the [Syntax Specification](SYNTAX.md).

### Invalid Command Arguments
If invoked without arguments or with invalid commands:
```bash
bun run index.ts
```
Output:
```
Usage:
  bun run cli.ts <direction: compile | translate> <file>
  bun run cli.ts verify
```
