# Codon Subtree-Hashing Macro System

Codon's **Subtree-Hashing Macro System** (introduced in Revision 7a) is an AST-level code compaction and expansion engine designed to maximize token efficiency for Large Language Models (LLMs).

By pairing deterministic AST subtree canonicalization with an empirical dictionary of 721 high-frequency code clones mined from thousands of open-source repositories (`dict.json`), Codon automatically compacts recurring 12–127 AST node subtrees into ultra-dense 2–4 token macro calls (`M!name(...)`).

---

## Table of Contents

1. [Why Codon Macros?](#why-codon-macros)
2. [What are Level-2 Code Clones?](#what-are-level-2-code-clones)
3. [Macro Engine Architecture](#macro-engine-architecture)
   - [The Empirical Dictionary (`dict.json`)](#the-empirical-dictionary-dictjson)
   - [Lexical Scope Resolution (`resolveScopes`)](#lexical-scope-resolution-resolvescopes)
   - [Canonical AST Normalization (`normalizeSubtree`)](#canonical-ast-normalization-normalizesubtree)
   - [Wyhash Hashing & O(1) Subtree Matching](#wyhash-hashing--o1-subtree-matching)
   - [Template Expansion & AST Re-insertion (`expandToAST`)](#template-expansion--ast-re-insertion-expandtoast)
   - [Zero Runtime Overhead](#zero-runtime-overhead)
4. [Macro Invocation Grammar & Syntax](#macro-invocation-grammar--syntax)
   - [Expression-Level Macros](#expression-level-macros)
   - [Statement-Level Macros](#statement-level-macros)
   - [Embedded Function Call Arguments](#embedded-function-call-arguments)
   - [Parameterless Macros](#parameterless-macros)
   - [Delimiters & Parameter Types](#delimiters--parameter-types)
5. [Comprehensive Catalog of Popular Macros](#comprehensive-catalog-of-popular-macros)
   - [Math & Array Utilities](#1-math--array-utilities)
   - [String Manipulation Idioms](#2-string-manipulation-idioms)
   - [Object & AST Coordinate Records](#3-object--ast-coordinate-records)
   - [Prototype & Object-Oriented Inheritance](#4-prototype--object-oriented-inheritance)
   - [Testing & Assertion Closures](#5-testing--assertion-closures)
   - [Variable Declarations & TypeScript Polyfills](#6-variable-declarations--typescript-polyfills)
   - [DOM & Method Chaining](#7-dom--method-chaining)
   - [JSON Parsing & Defensive Guards](#8-json-parsing--defensive-guards)
6. [Development Workflows](#development-workflows)
   - [Automatic Compaction (JS ➔ Codon)](#automatic-compaction-js--codon)
   - [Hand-Authoring Codon with Macros](#hand-authoring-codon-with-macros)
   - [Compiling Macros to JavaScript (Codon ➔ JS)](#compiling-macros-to-javascript-codon--js)
7. [Programmatic API (`MacroDictionary`)](#programmatic-api-macrodictionary)
8. [Error Handling & Diagnostics](#error-handling--diagnostics)

---

## Why Codon Macros?

In modern software development, fullstack JavaScript code contains substantial recurring structural boilerplate:
- Calculating random array indices: `Math.floor(Math.random() * items.length)`
- Prototype-based inheritance setup: `Child.prototype = Object.create(Parent.prototype)`
- String capitalization: `str.charAt(0).toUpperCase() + str.slice(1)`
- Test assertions: `() => { expect(fn(input)).toBe(expected); }`
- Defensive JSON parsing and validation pipelines
- TypeScript helper runtime polyfills (`__decorate`, `__awaiter`)

For Large Language Models (LLMs), emitting this boilerplate consumes valuable context window space and compute budget. Furthermore, emitting multi-token boilerplate repeatedly increases the likelihood of subtle syntax hallucinations (such as mismatched parentheses or missing method calls).

Codon solves this problem by assigning verified, compact macro identifiers (`M!name(...)`) to recurring AST patterns:
- **60%–85% Token Reduction**: Replaces 10–50 verbose tokens with 2–5 tokens per pattern.
- **Zero Hallucination of Boilerplate**: Verified AST templates guarantee structural correctness.
- **Bi-directional Fidelity**: JavaScript containing popular patterns automatically condenses to macros during translation and compiles back to semantically identical JavaScript with 100% Babel parser validation.
- **Zero Ambiguity**: The distinct `M!` prefix ensures zero collision with Codon's J-style verbs, control structures, and array expressions.

---

## What are Level-2 Code Clones?

In static analysis and software repository mining, code clones are classified into four types:
- **Type-1 (Exact)**: Identical code fragments except for whitespace and comments.
- **Type-2 (Parameterized / Structural)**: Syntactically identical AST subtrees where only identifier names, literal values, and local variable names vary.
- **Type-3 (Gapped)**: Similar code fragments with inserted, modified, or deleted statements.
- **Type-4 (Semantic)**: Functionally identical code implemented with completely different syntax.

Codon's macro system targets **Level-2 Code Clones**. Each macro in `dict.json` defines a canonical structural template where:
1. **Captured Identifiers (`__clone_arg0`, `__clone_arg1`)**: Variables bound outside the subtree that are passed into the pattern.
2. **Parameterized Literals (`__clone_lit0`, `__clone_lit1`)**: Concrete string, numeric, or boolean constants passed into the pattern.
3. **Internal Local Variables (`__clone_local0`, `__clone_local1`)**: Variables declared and used strictly inside the subtree, automatically renamed with hygienic identifiers.
4. **Fixed Identifiers & Constants (`fixed:Math`, `fixed:prototype`)**: Built-in runtime globals and object property names that never change.

---

## Macro Engine Architecture

The macro engine consists of five integrated stages:

```mermaid
sequenceDiagram
    autonumber
    participant JS as JavaScript AST (Babel)
    participant Scope as Scope Resolver (resolveScopes)
    participant Norm as Normalizer (normalizeSubtree)
    participant Dict as MacroDictionary (dict.json)
    participant Parser as CodonToASTParser
    participant Compiler as CodonToJSCompiler

    Note over JS,Dict: Translation Phase (JS -> Codon)
    JS->>Scope: Build lexical scope graph
    Scope-->>Norm: Provide binding declarations
    Norm->>Norm: Canonicalize AST & compute wyhash
    Norm->>Dict: Lookup hash in O(1)
    Dict-->>JS: Return matching MacroEntry + argument bindings
    JS->>JS: Emit M!macro_name(arg1;arg2;...)

    Note over Parser,Compiler: Compilation Phase (Codon -> JS)
    Parser->>Parser: Encounter M!macro_name(args)
    Parser->>Dict: lookupByName(macro_name)
    Dict->>Dict: expandTemplate(template, args)
    Dict->>Dict: Parse expanded code to AST (expandToAST)
    Dict-->>Parser: Insert AST subtree into program
    Parser->>Compiler: Normalized ESTree AST
    Compiler->>Compiler: Emit standard JavaScript via @babel/generator
```

### The Empirical Dictionary (`dict.json`)

The macro library is backed by `dict.json`, containing **721 popularity-ranked Level-2 code clones**. The dictionary is categorized by AST node type:

| Category | Total Macros | Common Node Types |
| :--- | :--- | :--- |
| **Statement** | **358** | `ExpressionStatement` (200), `BlockStatement` (75), `IfStatement` (59), `ReturnStatement` (12), `ForInStatement` (5) |
| **Expression** | **237** | `CallExpression` (54), `ObjectExpression` (44), `MemberExpression` (31), `FunctionExpression` (30), `ArrayExpression` (21), `ArrowFunctionExpression` (18), `BinaryExpression` (18), `LogicalExpression` (15) |
| **Declaration** | **126** | `VariableDeclaration` (94), `FunctionDeclaration` (32) |
| **Total** | **721** | Encapsulating subtrees ranging from 12 to 127 AST nodes |

Each entry in `dict.json` conforms to the `MacroEntry` interface:

```typescript
export interface MacroEntry {
    hash: string;             // 64-bit wyhash signature
    name: string;             // Unique identifier, e.g. "m_call_expr_11"
    nodeType: string;         // AST node type, e.g. "CallExpression"
    category: "statement" | "expression" | "declaration";
    template: string;         // String template with __clone placeholders
    templateReady: boolean;   // Ready for expansion
    parameters: MacroParameter[]; // Captured arguments and parameterized literals
    locals: MacroLocal[];     // Internal local identifiers
    size: number;             // Total AST node count in subtree (12 to 127)
    depth: number;            // Depth of AST subtree
    count: number;            // Occurrences across mined repositories
    score: number;            // Popularity score = count * log(size)
    canonical: string;        // Canonical JSON signature for collision verification
}
```

### Lexical Scope Resolution (`resolveScopes`)

Before matching can occur, `resolveScopes` in `macro-dict.ts` constructs a hierarchical lexical scope graph of the JavaScript program. It traverses:
- Function declarations and arrow function parameter lists
- Block statements (`{ ... }`)
- Variable declarations (`let`, `const`, `var` respecting function/var hoisting)
- Class declarations and method bodies
- Import specifiers

```typescript
export interface Scope {
    parent?: Scope;
    varScope: Scope;
    values: Map<string, ScopeBinding>;
    types: Map<string, ScopeBinding>;
}
```

When analyzing a candidate subtree at `root`:
1. If an identifier was declared **outside** `root.start ... root.end`, it is classified as an **external capture** (`__clone_arg0`, `__clone_arg1`).
2. If an identifier was declared **inside** `root.start ... root.end`, it is classified as an **internal local** (`__clone_local0`, `__clone_local1`).
3. If an identifier has no declaration in any scope, and is a well-known global or built-in (`Math`, `Object`, `expect`, `JSON`, `console`), it is treated as a **fixed identifier** (`fixed:Math`).
4. Non-computed member expression properties (`obj.prop`) and object keys (`{ key: 1 }`) are treated as **fixed identifiers** (`fixed:prop`).

### Canonical AST Normalization (`normalizeSubtree`)

To ensure structurally identical subtrees produce the exact same hash regardless of non-semantic differences, `normalizeSubtree`:
1. **Strips AST Trivia**: Omits comments, source coordinates (`loc`, `range`, `start`, `end`), directives, and formatting metadata.
2. **Alphabetizes Object Keys**: Sorts object keys deterministically so property ordering differences do not change the hash.
3. **Categorizes Literals**:
   - Universal constants (`0`, `1`, `-1`, `2`, `""`, `true`, `false`, `null`, `undefined`, `"use strict"`, `"utf-8"`) remain **fixed**.
   - All other literals become **parameterized slots** (`__clone_lit0`, `__clone_lit1`).
4. **Normalizes Field Variations**: Ensures optional chaining flags (`optional: false`) and arrow function expression flags are consistently structured.

### Wyhash Hashing & O(1) Subtree Matching

Once normalized, the subtree is serialized into a canonical JSON string. Codon uses `Bun.hash(canonical).toString()` (the high-performance 64-bit wyhash algorithm) to compute a 64-bit integer hash string.

During JavaScript-to-Codon translation (`JSToCodonTranslator`):
1. For each AST node, `tryMacroMatch(node)` computes its canonical hash.
2. If the hash exists in `MacroDictionary`, it verifies the canonical string to prevent hash collisions.
3. It maps each parameter in `macro.parameters` to the actual AST argument or literal value.
4. Emits `M!${macro.name}(${args.join(";")})` (or `M!${macro.name}()`).

### Template Expansion & AST Re-insertion (`expandToAST`)

When the Codon parser encounters `M!name(args)` in `parseStatement` or `parseExpression`:
1. **Argument Parsing**: Extracts arguments separated by semicolons (`;`) or commas (`,`).
2. **Template Expansion (`expandTemplate`)**:
   - Replaces `__clone_arg0`, `__clone_arg1`, etc., with the passed argument strings.
   - Replaces `__clone_lit0`, `__clone_lit1`, etc., with the passed literal values.
   - Generates hygienic names for internal locals: `_loc_0`, `_loc_1`.
3. **Expression Wrapping**: If `macro.category === "expression"`, the expanded code is automatically wrapped in parentheses `(${expandedCode})` to avoid JavaScript parser ambiguity between object literal expressions and block statements.
4. **AST Generation**: `@babel/parser` parses the expanded code into standard ESTree AST nodes.
5. **AST Re-insertion**: The expanded AST node is inserted directly into the AST tree where the macro call appeared.

### Zero Runtime Overhead

Because macros expand directly into standard ESTree AST subtrees during compilation, JavaScript code generation via `@babel/generator` produces native, standard JavaScript. There is **zero runtime overhead**, no extra function call indirection, and no runtime library requirement for macros.

---

## Macro Invocation Grammar & Syntax

Macros use the distinct `M!` prefix followed by the macro name and an argument list in parentheses:

```ebnf
MacroInvocation ::= "M!" MacroName "(" [ ArgumentList ] ")"
MacroName       ::= [a-zA-Z0-9_]+
ArgumentList    ::= Argument ( ( ";" | "," ) Argument )*
Argument        ::= Expression | Literal | Identifier
```

### Expression-Level Macros

When used on the right-hand side of an assignment or within an expression:

```codon
NB. Expression macro assigned to variable
idx =: M!m_call_expr_11(items)

NB. Expression macro in return statement
return. M!m_binary_expr_32(word)
```

Transpiled JavaScript:
```javascript
const idx = Math.floor(Math.random() * items.length);
return word.charAt(0).toUpperCase() + word.slice(1);
```

### Statement-Level Macros

When used as a standalone statement:

```codon
NB. Standalone statement macro
M!m_expression_stmt_17(Child;Parent)
```

Transpiled JavaScript:
```javascript
Child.prototype = Object.create(Parent.prototype);
```

### Embedded Function Call Arguments

When passed as an argument to another function or method, wrap the macro call in parentheses:

```codon
(console.log (M!m_binary_expr_32(word)))
```

Transpiled JavaScript:
```javascript
console.log(word.charAt(0).toUpperCase() + word.slice(1));
```

### Parameterless Macros

When a macro requires no parameters (all variables inside are internal locals or universal constants):

```codon
M!m_variable_decl_4()
```

Transpiled JavaScript:
```javascript
var _loc_0, _loc_1, _loc_2, _loc_3, _loc_4, _loc_5;
```

### Delimiters & Parameter Types

Arguments can be delimited by either semicolons (`;`) or commas (`,`):
```codon
M!m_arrow_function_expr_5('js';'file.js';getLanguage)
M!m_arrow_function_expr_5('js', 'file.js', getLanguage)
```

Both delimiters produce identical results. Semicolon delimiters are recommended when passing expressions that themselves contain commas to avoid ambiguity.

---

## Comprehensive Catalog of Popular Macros

Below is a curated reference of high-frequency, high-impact macros from `dict.json`:

### 1. Math & Array Utilities

#### `m_call_expr_11`
- **Category / AST Node**: Expression / `CallExpression`
- **Subtree Size**: 12 AST nodes
- **Description**: Computes a random array index within `[0, items.length - 1]`.
- **Parameters**: `arg0` (target array identifier)
- **Codon**:
  ```codon
  randomIndex =: M!m_call_expr_11(items)
  ```
- **JavaScript**:
  ```javascript
  const randomIndex = Math.floor(Math.random() * items.length);
  ```

#### `m_binary_expr_7`
- **Category / AST Node**: Expression / `BinaryExpression`
- **Subtree Size**: 13 AST nodes
- **Description**: Chained array lookup string concatenation.
- **Parameters**: `lit0`, `arg0`, `lit1`, `lit2`, `lit3`, `lit4`
- **Codon**:
  ```codon
  msg =: M!m_binary_expr_7('(';arr;0;',';arr;1;')')
  ```
- **JavaScript**:
  ```javascript
  const msg = "(" + arr[0] + "," + arr[1] + ")";
  ```

---

### 2. String Manipulation Idioms

#### `m_binary_expr_32`
- **Category / AST Node**: Expression / `BinaryExpression`
- **Subtree Size**: 13 AST nodes
- **Description**: Capitalizes the first letter of a string (title-casing).
- **Parameters**: `arg0` (string variable)
- **Codon**:
  ```codon
  capitalized =: M!m_binary_expr_32(word)
  ```
- **JavaScript**:
  ```javascript
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
  ```

---

### 3. Object & AST Coordinate Records

#### `m_object_expr_1`
- **Category / AST Node**: Expression / `ObjectExpression`
- **Subtree Size**: 19 AST nodes
- **Description**: Generates a standard AST location coordinate record (`start` and `end` with `line: 1` and parameterized column numbers).
- **Parameters**: `lit0` (start column), `lit1` (end column)
- **Codon**:
  ```codon
  loc =: M!m_object_expr_1(10;25)
  ```
- **JavaScript**:
  ```javascript
  const loc = {
    start: {
      line: 1,
      column: 10
    },
    end: {
      line: 1,
      column: 25
    }
  };
  ```

---

### 4. Prototype & Object-Oriented Inheritance

#### `m_expression_stmt_17`
- **Category / AST Node**: Statement / `ExpressionStatement`
- **Subtree Size**: 12 AST nodes
- **Description**: Sets up standard prototype-based inheritance between a child constructor and a parent constructor.
- **Parameters**: `arg0` (Child class/constructor), `arg1` (Parent class/constructor)
- **Codon**:
  ```codon
  M!m_expression_stmt_17(TorusKnotCurve;Curve)
  ```
- **JavaScript**:
  ```javascript
  TorusKnotCurve.prototype = Object.create(Curve.prototype);
  ```

#### `m_expression_stmt_15`
- **Category / AST Node**: Statement / `ExpressionStatement`
- **Subtree Size**: 18 AST nodes
- **Description**: Attaches an auto-outdent method handler to `this`.
- **Parameters**: `lit0`, `arg0`
- **Codon**:
  ```codon
  M!m_expression_stmt_15('indent';handler)
  ```

---

### 5. Testing & Assertion Closures

#### `m_arrow_function_expr_5`
- **Category / AST Node**: Expression / `ArrowFunctionExpression`
- **Subtree Size**: 12 AST nodes
- **Description**: Standard unit test assertion arrow closure expecting a function call to return an expected value.
- **Parameters**: `lit0` (expected value), `lit1` (input value), `arg0` (function under test)
- **Codon**:
  ```codon
  testCase =: M!m_arrow_function_expr_5('js';'file.js';getLanguage)
  ```
- **JavaScript**:
  ```javascript
  const testCase = () => {
    expect(getLanguage("file.js")).toBe("js");
  };
  ```

#### `m_expression_stmt_16`
- **Category / AST Node**: Statement / `ExpressionStatement`
- **Subtree Size**: 12 AST nodes
- **Description**: Chai/Mocha assertion verifying that an argument is of a given type.
- **Parameters**: `lit0` (type string), `arg0` (tested value), `arg1` (`expect` function)
- **Codon**:
  ```codon
  M!m_expression_stmt_16('string';result;expect)
  ```
- **JavaScript**:
  ```javascript
  expect(result).to.be.an("string");
  ```

#### `m_expression_stmt_13`
- **Category / AST Node**: Statement / `ExpressionStatement`
- **Subtree Size**: 13 AST nodes
- **Description**: Cypress DOM element retrieval, text assertion, and click chain.
- **Parameters**: `lit0` (content text), `lit1` (selector string)
- **Codon**:
  ```codon
  M!m_expression_stmt_13('Submit';'button.primary')
  ```
- **JavaScript**:
  ```javascript
  cy.get("button.primary").contains("Submit").click();
  ```

---

### 6. Variable Declarations & TypeScript Polyfills

#### `m_variable_decl_4`
- **Category / AST Node**: Declaration / `VariableDeclaration`
- **Subtree Size**: 13 AST nodes
- **Description**: Parameterless declaration of reusable scratch variables (`var elm, elmScope, $scope, $compile, ...`).
- **Parameters**: None
- **Codon**:
  ```codon
  M!m_variable_decl_4()
  ```
- **JavaScript**:
  ```javascript
  var _loc_0, _loc_1, _loc_2, _loc_3, _loc_4, _loc_5;
  ```

#### `m_variable_decl_2`
- **Category / AST Node**: Declaration / `VariableDeclaration`
- **Subtree Size**: 127 AST nodes
- **Description**: TypeScript decorator runtime helper polyfill (`__decorate`).
- **Parameters**: `lit0` through `lit5`
- **Codon**:
  ```codon
  M!m_variable_decl_2()
  ```
- **JavaScript**:
  ```javascript
  var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
  ```

#### `m_variable_decl_18`
- **Category / AST Node**: Declaration / `VariableDeclaration`
- **Subtree Size**: 85 AST nodes
- **Description**: TypeScript async/await runtime helper polyfill (`__awaiter`).

---

### 7. DOM & Method Chaining

#### `m_member_expr_3`
- **Category / AST Node**: Expression / `MemberExpression`
- **Subtree Size**: 12 AST nodes
- **Description**: Chained element append and attribute configuration.
- **Parameters**: `lit0` (attr key), `lit1` (attr val), `lit2` (append content), `arg0` (DOM element)
- **Codon**:
  ```codon
  el =: M!m_member_expr_3('width';100;'<svg>';container)
  ```
- **JavaScript**:
  ```javascript
  const el = container.append("<svg>").attr("width", 100);
  ```

---

### 8. JSON Parsing & Defensive Guards

#### `m_block_stmt_14`
- **Category / AST Node**: Statement / `BlockStatement`
- **Subtree Size**: 24 AST nodes
- **Description**: Defensive JSON parse block with truthiness guard.
- **Parameters**: `arg0` (parsed output var), `arg1` (raw JSON input string)
- **Codon**:
  ```codon
  M!m_block_stmt_14(data;rawPayload)
  ```
- **JavaScript**:
  ```javascript
  {
    data = JSON.parse(rawPayload);
    if (data) {
      // guard logic
    }
  }
  ```

---

## Development Workflows

### Automatic Compaction (JS ➔ Codon)

When translating JavaScript files to Codon, the translator automatically detects matching Level-2 clones and emits macro calls:

```bash
bun run index.ts translate src/utils.js
```

Given `src/utils.js`:
```javascript
export function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
```

The translator emits `src/utils.cdn`:
```codon
export. fn. getRandomItem items do.
return. (from (M!m_call_expr_11(items)) items)
end.

export. fn. capitalize word do.
return. M!m_binary_expr_32(word)
end.
```

Notice:
- `Math.floor(Math.random() * items.length)` compacted to `M!m_call_expr_11(items)` (saving 8 tokens).
- `word.charAt(0).toUpperCase() + word.slice(1)` compacted to `M!m_binary_expr_32(word)` (saving 9 tokens).

### Hand-Authoring Codon with Macros

You can write macros directly in your Codon source code:

```codon
NB. Define an inheritance relationship
class. Shape do.
end.

class. Circle do.
end.

M!m_expression_stmt_17(Circle;Shape)

NB. Create random coordinates
x =: M!m_call_expr_11(gridWidth)
y =: M!m_call_expr_11(gridHeight)
```

### Compiling Macros to JavaScript (Codon ➔ JS)

Run the compiler to expand all macros back into standard JavaScript:

```bash
bun run index.ts compile src/shapes.cdn
```

The resulting `src/shapes.js` contains standard, clean JavaScript:
```javascript
class Shape {}
class Circle {}
Circle.prototype = Object.create(Shape.prototype);
const x = Math.floor(Math.random() * gridWidth.length);
const y = Math.floor(Math.random() * gridHeight.length);
```

---

## Programmatic API (`MacroDictionary`)

You can inspect, query, and expand macros directly in TypeScript:

```typescript
import { macroDictionary } from "./macro-dict";

// Load the dictionary (loads lazily on first access if not called)
macroDictionary.load();

console.log(`Total macros loaded: ${macroDictionary.size}`); // 721

// Lookup a macro by name
const macro = macroDictionary.lookupByName("m_call_expr_11");
if (macro) {
    console.log(`Template: ${macro.template}`);
    console.log(`Parameters:`, macro.parameters);

    // Expand template into code string
    const code = macroDictionary.expandTemplate(macro, ["myList"]);
    console.log(`Expanded code: ${code}`);
    // Output: Math.floor(Math.random() * myList.length)

    // Expand template directly into Babel ESTree AST node
    const astNode = macroDictionary.expandToAST(macro, ["myList"]);
    console.log(`AST Node Type: ${astNode.type}`); // CallExpression
}

// Find all macros for a given AST node type
const ifMacros = macroDictionary.entriesForNodeType("IfStatement");
console.log(`IfStatement macros available: ${ifMacros.length}`);
```

---

## Error Handling & Diagnostics

If an invalid or unknown macro is used, the Codon parser provides precise diagnostics:

1. **Unknown Macro**:
   ```codon
   bad =: M!unknown_macro_name(foo)
   ```
   Throws:
   ```
   Error: Unknown macro: unknown_macro_name
   ```

2. **Malformed Macro Invocation**:
   ```codon
   bad =: M! (missing identifier)
   ```
   Throws:
   ```
   Error: Invalid macro invocation: M!
   ```

3. **Macro Expansion Failure**:
   If an expanded macro fails to parse into a valid AST, Babel's syntax error with exact line and column coordinates is surfaced to the console.
