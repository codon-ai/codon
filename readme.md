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
