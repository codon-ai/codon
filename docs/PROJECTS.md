# Codon Projects: Multi-File Applications & Compilation

Codon is a fully featured, array-oriented programming language capable of powering entire multi-file production applications. Codon projects compile to standard ECMAScript modules (ESM) that run natively on **Node.js**, **Bun**, **Deno**, and modern browsers without extra runtime transpilers.

This guide details project architecture, module system semantics, configuration via `codon.json`, CLI build tooling (`codon build`, `codon init`), npm package integration, and deployment workflows.

---

## 1. Quickstart: Bootstrapping a Project

Codon provides a dedicated initializer (`codon init`) that configures a project following **Method B** (standard ESM compilation with `package.json` scripts):

```bash
# Initialize a new project in the current directory or a subfolder
codon init my-app
cd my-app
```

`codon init` bootstraps the following project structure:

```
my-app/
├── codon.json          # Codon compiler configuration
├── package.json        # Node/Bun package configuration ("type": "module")
└── src/
    └── index.cdn       # Starter Codon entrypoint
```

### Generated `package.json`
```json
{
  "name": "my-app",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "build": "codon build",
    "dev": "codon build --watch",
    "start": "node dist/index.js"
  }
}
```

### Compiling and Running
```bash
# 1. Compile all .cdn files in src/ to dist/
npm run build    # or: codon build

# 2. Run the compiled application
npm start        # executes: node dist/index.js (or bun dist/index.js)
```

---

## 2. Project Architecture & Directory Layout

A typical production Codon project organizes source code, static assets, and utilities under `src/`:

```
my-project/
├── codon.json
├── package.json
├── node_modules/
├── src/
│   ├── index.cdn             # Application entrypoint
│   ├── server.cdn            # HTTP API / server logic
│   ├── utils/
│   │   ├── math.cdn          # Array calculations and algorithms
│   │   └── strings.cdn       # String manipulation helpers
│   ├── config/
│   │   └── app-config.json   # Static asset (copied automatically)
│   └── styles/
│       └── main.css          # Static asset (copied automatically)
└── dist/                     # Compiled ESM distribution (generated)
    ├── codon-runtime.js      # Zero-dependency combinators & array verbs
    ├── index.js
    ├── server.js
    ├── utils/
    │   ├── math.js
    │   └── strings.js
    ├── config/
    │   └── app-config.json
    └── styles/
        └── main.css
```

---

## 3. Module System: Imports, Exports & Specifiers

Codon features native ECMAScript module semantics with automatic extension rewriting for `.cdn` files.

### Relative Imports Between `.cdn` Files
Import other `.cdn` modules using relative paths. During compilation, the Codon compiler automatically rewrites `.cdn` specifiers to `.js` so the compiled JavaScript files resolve seamlessly:

```codon
NB. src/index.cdn
import. { calculateAverage, sumVector } from './utils/math.cdn'
import. { capitalize } from './utils/strings.cdn'

scores =: [95, 82, 91, 100, 78]
(console.log (calculateAverage scores))
```

*Compiled output (`dist/index.js`):*
```javascript
import { calculateAverage, sumVector } from "./utils/math.js";
import { capitalize } from "./utils/strings.js";

const scores = [95, 82, 91, 100, 78];
console.log(calculateAverage(scores));
```

Extensionless relative imports (`from './utils/math'`) are also automatically resolved and rewritten to `.js` if `src/utils/math.cdn` exists.

### Re-exports
Codon supports comprehensive re-export patterns:

```codon
NB. Re-export everything from another module
export. * from './utils/math.cdn'

NB. Re-export everything as a namespace
export. * as mathUtils from './utils/math.cdn'

NB. Re-export specific named symbols with optional aliases
export. { sumVector, calculateAverage as avg } from './utils/math.cdn'

NB. Export locally defined identifiers
export. { localHandler, config }
```

### Dynamic Imports
Asynchronous code splitting and dynamic module loading use the `(import ...)` expression:

```codon
async_fn. loadFeature featureName do.
  module =: @ (import `./features/${featureName}.cdn`)
  @ (module.initialize)
end.
```

*Compiled output:*
```javascript
async function loadFeature(featureName) {
  const module = await import(`./features/${featureName}.js`);
  await module.initialize();
}
```

### Static Asset Imports & Import Attributes
Codon supports static asset imports with HTML/W3C import attributes (`with` / `assert`):

```codon
NB. Import JSON configuration with import attributes
import. config from './config/app-config.json' with { type: 'json' }

NB. Side-effect import for CSS or polyfills
import. './styles/main.css'

(console.log `Port configured: ${config.port}`)
```

*Compiled output:*
```javascript
import config from "./config/app-config.json" with { type: "json" };
import "./styles/main.css";

console.log(`Port configured: ${config.port}`);
```

During build, static assets (e.g. `.json`, `.css`, `.svg`, `.png`, `.html`) are automatically copied from `src/` to `dist/`, preserving the directory hierarchy.

---

## 4. Working with npm Packages & Node Built-ins

Codon seamlessly interfaces with the entire Node.js and JavaScript package ecosystem. Any package installed in `node_modules` can be imported directly:

### Installing Packages
```bash
# Using bun
bun add express lodash-es
bun add -d @types/node

# Or using npm
npm install express lodash-es
```

### Using npm Packages & Node Built-ins in Codon
```codon
NB. src/server.cdn
import. express from 'express'
import. * as path from 'node:path'
import. * as fs from 'node:fs'
import. { chunk } from 'lodash-es'
import. { calculateAverage } from './utils/math.cdn'

app =: (express)
port =: 3000

NB. Route handler using concise arrow definition
(app.get '/api/metrics' {{ req, res => do.
  data =: [12, 18, 25, 42, 60]
  groups =: (chunk data 2)
  avg =: (calculateAverage data)
  
  (res.json O(status:'ok';groups;average:avg))
end. }})

(app.listen port {{ => do.
  (console.log `Server listening on http://localhost:${port}`)
end. }})
```

*Compiled output (`dist/server.js`):*
```javascript
import express from "express";
import * as path from "node:path";
import * as fs from "node:fs";
import { chunk } from "lodash-es";
import { calculateAverage } from "./utils/math.js";

const app = express();
const port = 3000;

app.get("/api/metrics", (req, res) => {
  const data = [12, 18, 25, 42, 60];
  const groups = chunk(data, 2);
  const avg = calculateAverage(data);
  res.json({
    status: "ok",
    groups,
    average: avg
  });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
```

---

## 5. Project Configuration (`codon.json`)

The compiler reads its configuration from `codon.json` located at the project root.

```json
{
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "rewriteImportExtensions": true,
    "copyAssets": true,
    "bundleRuntime": true,
    "autoImportRuntime": true,
    "clean": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.*"
  ]
}
```

### Configuration Options Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `rootDir` | `string` | `"src"` | Root directory containing Codon source `.cdn` files and assets. |
| `outDir` | `string` | `"dist"` | Target directory for compiled JavaScript and copied assets. |
| `rewriteImportExtensions` | `boolean` | `true` | Rewrites `.cdn` import specifiers to `.js` for native ESM loading. |
| `copyAssets` | `boolean` | `true` | Copies non-`.cdn` assets (JSON, CSS, SVG, etc.) from `rootDir` to `outDir`. |
| `bundleRuntime` | `boolean` | `true` | Emits standalone `dist/codon-runtime.js` into output directory. |
| `autoImportRuntime` | `boolean` | `true` | Automatically injects named imports for referenced Codon verbs (`sum`, `fork`, `tally`, etc.). |
| `clean` | `boolean` | `false` | Empties `outDir` before building. |
| `include` | `string[]` | `["src/**/*"]` | Glob patterns of files to include in project compilation. |
| `exclude` | `string[]` | `["node_modules", "dist"]` | Glob patterns of files/directories to ignore. |

---

## 6. Build Tooling (`codon build`)

The Codon CLI provides a compiler interface similar to TypeScript's `tsc`:

```bash
# Build the project in the current directory
codon build

# Build a project located in a specific directory
codon build ./packages/client

# Watch mode: incremental recompilation on file change
codon build --watch
codon build -w

# Override output directory
codon build --outDir ./build

# Specify a custom configuration file
codon build --project ./codon.prod.json

# Clean output directory before building
codon build --clean
```

### Watch Mode
When running `codon build -w`, the compiler:
1. Performs an initial full build.
2. Watches the `rootDir` recursively using filesystem events.
3. Debounces rapid file changes.
4. Incrementally recompiles only modified `.cdn` files (typically < 5ms).
5. Hot-syncs static assets upon change.
6. Automatically cleans up destination files when source files are deleted.

---

## 7. Zero-Dependency Runtime (`codon-runtime.js`)

When `bundleRuntime: true` (default), the compiler emits a standalone, zero-dependency `dist/codon-runtime.js` module. It contains pure vanilla JavaScript implementations of:

- **Combinators / Trains**: `fork`, `hook`, `atop`, `rank`.
- **Folds & Scans**: `fold`, `scan`, `sum`, `product`, `div`.
- **Array Primitives**: `tally`, `shape`, `head`, `tail`, `behead`, `curtail`, `take`, `drop`, `range`, `from`, `gradeUp`, `gradeDown`, `box`, `open`.

When your Codon code references verbs like `+/` or `#`, the compiler automatically inserts the appropriate relative import:

```javascript
import { sum, tally } from "./codon-runtime.js";
```

Nested modules (e.g. `dist/utils/math.js`) automatically receive correct parent-relative paths:

```javascript
import { sum } from "../codon-runtime.js";
```

No external runtime dependencies or npm packages are required to execute the compiled output.

---

## 8. Deployment & Execution Targets

The compiled `dist/` directory is standard ECMAScript modules and runs everywhere:

### Node.js (v18+)
```bash
node dist/index.js
```

### Bun
```bash
bun dist/index.js
```

### Deno
```bash
deno run --allow-net --allow-read dist/index.js
```

### Frontend Bundlers (Vite / Webpack / esbuild)
Codon-compiled code can be used directly as source input for Vite or Next.js:

```bash
# Compile Codon source to dist/
codon build -w

# In another terminal, run your frontend dev server pointing to dist/index.js
vite
```
