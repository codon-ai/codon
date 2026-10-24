````markdown
# J ↔ JS Transpiler

A bidirectional transpiler that converts JavaScript/React (ESTree/Babel AST) into `J` notation, and parses `J` notation back into executable JavaScript.

This project uses an Abstract Syntax Tree (AST) approach to guarantee structural accuracy during round-trip translations, leveraging `@babel/generator` for robust JavaScript emission.

## Features

- **Bidirectional Compilation**: Convert `.j` files to `.js` and vice versa.
- **AST-Based**: Uses standard ESTree interfaces, mapping them to Babel's AST for reliable code generation.
- **Advanced J Syntax Support**:
    - Direct Definition Functions (`{{ ... }}`)
    - Implicit map calls (`(...) "0 array`)
    - Object literals (`O(...)`)
    - Top-level local and global assignments (`=:`)
- **React/JSX Ready**: Designed with hooks to eventually lower and support JSX and React idioms.

## Prerequisites

- [Bun](https://bun.sh/) (or `ts-node` / Node.js)
- Dependencies: `@babel/parser`, `@babel/generator`

```bash
# Install dependencies
bun add @babel/parser @babel/generator
```
````

## Usage

The project includes a unified CLI tool for translating files in either direction.

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

## Architecture

The project is split into modular components:

- **`cli.ts`**: The command-line entry point. Handles file I/O, parsing arguments, and routing to the correct transpiler.
- **`j-parser.ts`**: A custom recursive-descent parser that tokenizes and parses `J` notation into a standard ESTree-compatible Abstract Syntax Tree.
- **`transpilers.ts`**:
- `JSToJTranspiler`: Walks a JavaScript AST and emits `J` code.
- `JToJSTranspiler`: Converts our generated ESTree AST into Babel's specific AST format, then uses `@babel/generator` to safely emit formatted, properly-parenthesized JavaScript.

- **`types.ts`**: Type definitions for the AST nodes, ensuring exhaustive checks during the transpilation steps.

## Known Limitations & Roadmap

- **Pattern Matching**: Destructuring assignment (`const { a, b } = c`) and Array patterns are currently placeholders and require further lowering logic.
- **JSX Encapsulation**: Complete mapping of `JSXElement` nodes into `React.createElement` (or direct J-equivalents) is planned for the next release.
- **Binary/Logical Operators**: Basic support is implemented, but complex precedence chains are deferred to the Babel generator on the JS side.

## License

MIT

```

```
