# Codon

A bidirectional compiler and translator that converts between Codon (`.cdn`) and JavaScript/React (`ESTree` / Babel AST).

Codon is designed from first principles to be **maximally token-efficient for Large Language Models (LLMs)**, shrinking context window consumption, boosting inference generation speed, and eliminating boilerplate hallucination while maintaining 100% round-trip AST fidelity.

---

## 📚 Documentation

Comprehensive documentation is available in the **[`docs/`](docs/README.md)** directory:

- 🚀 **[Macros System Guide](docs/MACROS.md)**: **Deep dive into Codon's Subtree-Hashing Macro System (`M!`)**, empirical Level-2 code clone compaction (`dict.json`), wyhash AST matching, and catalog.
- 📖 **[Syntax Specification](docs/SYNTAX.md)**: Complete language reference covering tacit trains, folds, monadic verbs, objects, classes, JSX, and control flow.
- ⚡ **[Runtime Reference](docs/RUNTIME.md)**: API reference for `codon-runtime.ts` combinators (`fork`, `hook`, `atop`, `rank`) and array primitives.
- 🛠️ **[Programmatic API](docs/API.md)**: TypeScript guide for `CodonToASTParser`, `CodonToJSCompiler`, `JSToCodonTranslator`, and `MacroDictionary`.
- 💻 **[CLI Manual](docs/CLI.md)**: Complete guide to the Codon command-line interface, scripts, and workflows.

---

## Key Features

- **Subtree-Hashing Macro System (`M!name(...)`)**:
  - Automatically identifies Level-2 code clones from an empirical dictionary of 721 popularity-ranked patterns mined across thousands of open-source repositories (`dict.json`).
  - Replaces 12–127 AST node subtrees (10–50 tokens) with compact 2–4 token macro calls (e.g., `M!m_call_expr_11(items)`), cutting boilerplate token consumption by 60%–85%.
  - Zero runtime penalty: expands directly to native JavaScript AST during compilation.
- **Bidirectional Compilation**:
  - Compile `.cdn` files to standard `.js`.
  - Translate `.js` and `.jsx` files to `.cdn` with automatic macro compaction.
  - 100% round-trip AST fidelity verified via Babel parser validation.
- **Array-Oriented Strengths Translated to JS**:
  - Tacit Trains: Forks `(fork f g h)` / `(f g h)` and Hooks `(hook f g)` / `(f g)`.
  - Reductions & Scans: Sum fold `+/`, product fold `*/`, scans `+\`, `fold`, `scan`.
  - Monadic Verbs: Monadic await `@ expr` and `@: expr`, tally `#`, reciprocal `%`, square root `%:`, absolute value `|`.
  - Right-to-Left order of operations (no operator precedence table needed).
  - Array Primitives: `tally`, `range`, `head`, `tail`, `behead`, `curtail`, `take`, `drop`, `from`, `gradeUp`, `gradeDown`.
- **Modern Web & Fullstack Expressed in Codon**:
  - ES6 Classes: `class. Name [extends Super] do. ... end.`, constructors, methods, async methods, getters, setters.
  - ES Modules: Concise `import. specifiers from 'mod'` and `export.` declarations.
  - Concise Objects: Colon pairs `O(key:val)`, property shorthand `O(prop)`, prefix spread `O(...rest)`.
  - Native Arrays: Brackets `[]`, `[elem]`, `[a, b]`, and spreads `[...prev, item]`.
  - Direct Definition Lambdas: `{{params => expr}}`, `{{params => do. ... end.}}`, `{{fn ...}}`.
  - React & JSX: Native support for tags, attributes, interpolations, and fragments `<> ... </>`.
- **Zero-Dependency Runtime (`codon-runtime.ts`)**:
  - Implements Codon combinators and array verbs for running Codon idioms natively in any JS environment.

---

## Token Efficiency: JavaScript vs Codon

| Pattern | Modern JavaScript | Codon Notation | Token Savings |
| :--- | :--- | :--- | :--- |
| **Random Array Index** | `Math.floor(Math.random() * items.length)` | `M!m_call_expr_11(items)` | **~75%** |
| **Prototype Inheritance** | `Child.prototype = Object.create(Parent.prototype);` | `M!m_expression_stmt_17(Child;Parent)` | **~65%** |
| **String Capitalization** | `word.charAt(0).toUpperCase() + word.slice(1)` | `M!m_binary_expr_32(word)` | **~75%** |
| **Monadic Await** | `const res = await fetch(url);` | `res =: @ (fetch url)` | **~50%** |
| **Object Shorthand & Spread** | `{ ...options, active: true, port }` | `O(...options;active:true;port)` | **~40%** |
| **Arrow Closure** | `const double = (x) => x * 2;` | `double =: {{x => (x * 2)}}` | **~50%** |
| **Average Fork** | `const avg = (arr) => sum(arr) / arr.length;` | `avg =: (fork sum div tally)` | **~40%** |
| **Sum Reduction** | `const total = nums.reduce((a, b) => a + b, 0);` | `total =: +/ nums` | **~70%** |
| **Numeric Vector** | `const primes = [2, 3, 5, 7, 11];` | `primes = 2 3 5 7 11` | **~50%** |
| **Function Declaration** | `function add(a, b) { return a + b; }` | `fn. add a,b do. return. (a + b) end.` | **~35%** |
| **Module Import** | `import { useState, useRef } from "react";` | `import. {useState,useRef} from 'react'` | **~45%** |

---

## Prerequisites

- [Bun](https://bun.sh/) (or Node.js v18+)

```bash
bun install
```

---

## Usage

### Compile Codon to JavaScript (`compile`)

Converts a `.cdn` file into standard JavaScript:

```bash
bun run compile path/to/file.cdn
# or: bun run index.ts compile path/to/file.cdn
```

*Output: Generates `path/to/file.js` in the same directory.*

### Translate JavaScript to Codon (`translate`)

Parses a `.js` (or `.jsx`) file and emits Codon notation with automatic Level-2 code clone compaction:

```bash
bun run translate path/to/file.js
# or: bun run index.ts translate path/to/file.js
```

*Output: Generates `path/to/file.cdn` in the same directory.*

### Run Unit Tests

```bash
bun test
```

---

## Architecture

The project is structured into modular components:

- **`index.ts`**: The CLI entrypoint. Handles file I/O, argument parsing, compilation, translation, and benchmark verification.
- **`codon-parser.ts`**: Recursive-descent parser that tokenizes and parses Codon notation, control structures, tacit trains, classes, and pattern destructuring into an ESTree-compatible Abstract Syntax Tree. Includes `parseMacroInvocation`.
- **`macro-dict.ts`**: Implements `MacroDictionary`, lexical scope resolution (`resolveScopes`), canonical wyhash subtree normalization (`normalizeSubtree`), and template expansion (`expandToAST`).
- **`dict.json`**: Empirical library of 721 Level-2 code clones mined from open-source repositories.
- **`transpilers.ts`**:
  - `JSToCodonTranslator`: Walks modern JavaScript/JSX AST, recognizes clone subtrees, and emits concise Codon notation.
  - `CodonToJSCompiler`: Normalizes AST nodes, maps tacit trains and Codon verbs, and uses `@babel/generator` to emit clean JavaScript.
- **`types.ts`**: Comprehensive TypeScript definitions for all supported AST nodes.
- **`codon-runtime.ts`**: Zero-dependency library of combinators and array primitives supporting Codon semantics in JavaScript.
- **`docs/`**: Comprehensive documentation suite ([README](docs/README.md), [Macros](docs/MACROS.md), [Syntax](docs/SYNTAX.md), [Runtime](docs/RUNTIME.md), [API](docs/API.md), [CLI](docs/CLI.md)).

---

## License

MIT
