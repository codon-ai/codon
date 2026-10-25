# Codon Language & Syntax Specification

This document provides a comprehensive, rigorous specification of the Codon language syntax, grammar, data types, operators, and control structures.

---

## Table of Contents

1. [Lexical Structure & Conventions](#1-lexical-structure--conventions)
2. [Right-to-Left Order of Operations](#2-right-to-left-order-of-operations)
3. [Literals & Data Types](#3-literals--data-types)
   - [Numeric Vectors & Negative Numbers](#numeric-vectors--negative-numbers)
   - [Strings & Template Literals](#strings--template-literals)
   - [Objects (`O(...)`)](#objects-o)
   - [Arrays (`[...]`)](#arrays-)
4. [Variable Declarations & Assignments](#4-variable-declarations--assignments)
   - [Right-to-Left Assignment (`=:`)](#right-to-left-assignment-)
   - [Member, Property & Compound Assignments](#member-property-and-compound-assignments)
   - [Update Expressions (`++`, `--`)](#update-expressions---)
   - [Pattern Destructuring](#pattern-destructuring)
5. [Monadic Verbs](#5-monadic-verbs)
   - [Await (`@` and `@:`)](#await--and-)
   - [Logical NOT (`!`)](#logical-not-)
   - [Tally (`#`)](#tally-)
   - [Reciprocal (`%`)](#reciprocal-)
   - [Square Root (`%:`)](#square-root-)
   - [Absolute Value (`|`)](#absolute-value-)
6. [Tacit Trains & Higher-Order Verbs](#6-tacit-trains--higher-order-verbs)
   - [Forks (`(fork f g h)` / `(f g h)`)](#forks-fork-f-g-h--f-g-h)
   - [Hooks (`(hook f g)` / `(f g)`)](#hooks-hook-f-g--f-g)
   - [Folds (`+/`, `*/`) & Scans (`+\`)](#folds---scans-)
7. [Functions & Closures](#7-functions--closures)
   - [Named Function Declarations (`fn.` / `async_fn.`)](#named-function-declarations-fn--async_fn)
   - [Direct Definition Arrow Functions (`{{params => expr}}`)](#direct-definition-arrow-functions-params--expr)
   - [Anonymous Function Expressions (`{{fn ...}}`)](#anonymous-function-expressions-fn-)
8. [Classes & Object-Oriented Programming](#8-classes--object-oriented-programming)
   - [Class Declarations](#class-declarations)
   - [Class Expressions](#class-expressions)
   - [Constructors, Methods, Getters, and Setters](#constructors-methods-getters-and-setters)
9. [Control Flow Structures](#9-control-flow-structures)
   - [Conditionals (`if.` / `elseif.` / `else.`)](#conditionals-if--elseif--else)
   - [Loops (`while.`, `whilst.`, `for.`, `for_in.`, `for_of.`)](#loops-while-whilst-for-for_in-for_of)
   - [Pattern Matching & Switch (`select.` / `case.`)](#pattern-matching--switch-select--case)
   - [Exception Handling (`try.` / `catch.` / `finally.`)](#exception-handling-try--catch--finally)
   - [Jumps & Returns (`return.`, `throw.`)](#jumps--returns-return-throw)
10. [Modules & Imports/Exports](#10-modules--importsexports)
11. [React & JSX Support](#11-react--jsx-support)
12. [Subtree-Hashing Macros (`M!`)](#12-subtree-hashing-macros-m)

---

## 1. Lexical Structure & Conventions

- **File Extension**: Codon source files use the `.cdn` extension.
- **Comments**: Comments begin with `NB.` (Latin *Nota Bene*, standard J comment syntax) and extend to the end of the line:
  ```codon
  NB. This is a single-line comment in Codon
  x =: 42 NB. Inline comment
  ```
- **Statements**: Statements are separated by newlines or semicolons (`;`). Semicolons at the end of lines are optional.
- **Blocks**: Multi-line statement blocks are demarcated by `<word>. ... do.` and terminated by `end.`:
  ```codon
  if. (x > 0) do.
    (console.log 'positive')
  end.
  ```

---

## 2. Right-to-Left Order of Operations

Unlike traditional languages that rely on operator precedence tables (PEMDAS), Codon adheres to **strict right-to-left evaluation order** for unparenthesized binary operators, matching standard APL and J semantics. Every operator takes its entire right-hand expression as its right argument:

```codon
res1 = 2 * 3 + 4   NB. In Codon: 2 * (3 + 4) = 14 (not 10)
res2 = 10 - 4 - 3  NB. In Codon: 10 - (4 - 3) = 9  (not 3)
res3 = 20 % 2 + 3  NB. In Codon: 20 / (2 + 3) = 4  (not 13)
res4 = 10 - 5 - 2  NB. In Codon: 10 - (5 - 2) = 7  (not 3)
```

To enforce standard precedence when compiling to JavaScript, the Codon compiler inserts explicit grouping parentheses where needed. When writing Codon, wrap sub-expressions in parentheses `(a * b) + c` if left-to-right evaluation is required.

---

## 3. Literals & Data Types

### Numeric Vectors & Negative Numbers

Codon supports space-separated numeric literals, forming arrays directly without brackets:

```codon
integers = 10 20 30 40     NB. const integers = [10, 20, 30, 40];
floats   = 1.5 2.5 3.5      NB. const floats = [1.5, 2.5, 3.5];
```

- **Negative Sign (`_`)**: Negative numbers use a leading underscore `_` to distinguish negation from subtraction:
  ```codon
  negatives = _1 _2 3 _4    NB. const negatives = [-1, -2, 3, -4];
  singleNeg = _42           NB. const singleNeg = -42;
  ```
- **Infinity (`_`)**: A standalone underscore represents `Infinity`:
  ```codon
  mixed = _ 10 20           NB. const mixed = [Infinity, 10, 20];
  ```

### Strings & Template Literals

- **Single and Double Quoted Strings**:
  ```codon
  str1 =: 'Hello world'
  str2 =: "Codon compiler"
  ```
- **Template Literals**: Enclosed in backticks with `${expression}` interpolation:
  ```codon
  greeting =: `Hello, ${user.name}! Count: ${count + 1}`
  ```

### Objects (`O(...)`)

Codon provides ultra-compact object literals via `O(...)`:

- **Colon Key-Value Pairs**: `O(key:val;key2:val2)`
- **Computed Property Keys**: `O([dynamicKey]:val)` compiles to `{ [dynamicKey]: val }`
- **Identifier Property Shorthand**: `O(prop1;prop2)` compiles to `{ prop1, prop2 }`
- **Prefix Spread**: `O(...rest;key:val)` compiles to `{ ...rest, key: val }`
- **Quoted Keys**: `O('Content-Type':'application/json')` for special characters
- **Empty Objects**: `O()` or `O''` compiles to `{}`
- **Legacy Alternating Pairs**: `O('key';val)` remains supported for backward compatibility

```codon
NB. Modern concise object literal with computed keys
config =: O(...baseConfig;[envKey]:'prod';port:8080;host:'localhost';timeout)
```

Transpiles to:
```javascript
const config = { ...baseConfig, [envKey]: "prod", port: 8080, host: "localhost", timeout };
```

### Arrays (`[...]`)

Codon supports concise bracket array expressions:

- **Empty Array**: `[]`
- **Single Element**: `[item]`
- **Multiple Elements**: `[1, 2, 3]` or `[1; 2; 3]` (both `,` and `;` delimiters supported)
- **Array Spread**: `[...prev, newItem]` or `[...a, ...b]`
- **Nested Arrays**: `[[1, 2], [3, 4]]`
- **Legacy Boxed Array Notation**: `(0$0)` (empty), `(,item)` (single), `(a;b;c)` (multi) remain fully supported.

```codon
items =: [1, 2, 3]
updated =: [...items, 4]
```

---

## 4. Variable Declarations & Assignments

### Right-to-Left Assignment (`=:`)

In Codon, assignment uses `=:` (transpiling to `const` for new declarations, or direct variable assignment):

```codon
total =: 100
name =: 'Codon'
```

Transpiles to:
```javascript
const total = 100;
const name = "Codon";
```

### Member, Property, and Compound Assignments

Codon supports native unparenthesized member assignments, property mutations, and compound in-place assignments without requiring wrapping parentheses:

- **Instance Member Assignment**:
  ```codon
  this.socket = ''
  this.retryCount =: 0
  this.isClosedManually = false
  ```
- **Object Property Assignment**:
  ```codon
  headers.host = 'localhost:8080'
  res.statusCode =: 200
  memoized.cache = cache
  ```
- **Computed Property Assignment**:
  ```codon
  this.heap.[idx] = tmp
  records.[id] = row
  arr[k] = val
  ```
- **Compound In-place Mutation**:
  ```codon
  count += 1
  this.retryCount += 1
  len -= 1
  total *= factor
  cache[key] ??= compute()
  ```

Transpiles to:
```javascript
this.socket = "";
this.retryCount = 0;
this.isClosedManually = false;
headers.host = "localhost:8080";
res.statusCode = 200;
memoized.cache = cache;
this.heap[idx] = tmp;
records[id] = row;
arr[k] = val;
count += 1;
this.retryCount += 1;
len -= 1;
total *= factor;
cache[key] ??= compute();
```

Legacy parenthesized assignment expressions `(this.socket = null)` and `(count += 1)` remain fully supported.

### Update Expressions (`++`, `--`)

Codon natively supports unparenthesized prefix and postfix update operators (`++`, `--`):

- **Postfix Increment/Decrement**:
  ```codon
  i++
  count--
  nextId.current++
  ```
- **Prefix Increment/Decrement**:
  ```codon
  ++step
  --rank
  ```
- **Inside Object Literals and Expressions**:
  ```codon
  todo =: O(id:nextId.current++;title:text)
  delay =: (baseDelay * (Math.pow 2 retryCount++))
  ```
- **Loop Counters**:
  ```codon
  for. i =: 0 ; (i < 10) ; i++ do.
    (console.log i)
  end.
  ```

Transpiles to:
```javascript
i++;
count--;
nextId.current++;
++step;
--rank;
const todo = { id: nextId.current++, title: text };
const delay = baseDelay * Math.pow(2, retryCount++);
for (const i = 0; i < 10; i++) {
  console.log(i);
}
```

Legacy parenthesized update expressions `(x++)` and `(++x)` remain fully supported.

### Pattern Destructuring

Codon supports full ES6 destructuring:

- **Array Destructuring**:
  ```codon
  [head, ...tail] =: list
  [a, b = 10] =: coordinates
  ```
- **Object Destructuring**:
  ```codon
  { name, age, active = true, ...rest } =: user
  { id: userId, title: taskTitle } =: task
  ```

---

## 5. Monadic Verbs

Monadic verbs operate on their right-hand argument with zero wrapping boilerplate:

### Await (`@` and `@:`)
Revision 1a introduced `@` and `@:` as prefix monadic await verbs, eliminating verbose `(await expr)` syntax:

```codon
NB. Standalone await
@ (delay 100)

NB. Await assignment
response =: @ (fetch url)
data =: @ (response.json())

NB. Colon-inflected verb form
user =: @: (getUser id)
```

Transpiles to:
```javascript
await delay(100);
const response = await fetch(url);
const data = await response.json();
const user = await getUser(id);
```

### Logical NOT (`!`)

Codon natively supports unparenthesized prefix logical negation (`!`):

- **Conditionals & Early Returns**:
  ```codon
  if. !input.trim() do.
    return.
  end.

  if. !response.ok do.
    (console.error 'Fetch failed')
  end.
  ```
- **Compound Logical Expressions**:
  ```codon
  valid =: !error && !loading
  canRetry =: !this.isClosed && (this.retryCount < this.maxRetries)
  ```
- **JSX State Binding**:
  ```codon
  <button disabled={!isValid}>Submit</button>
  ```

Transpiles to:
```javascript
if (!input.trim()) {
  return;
}
if (!response.ok) {
  console.error("Fetch failed");
}
const valid = !error && !loading;
const canRetry = !this.isClosed && this.retryCount < this.maxRetries;
<button disabled={!isValid}>Submit</button>;
```

Legacy parenthesized form `(! expr)` remains fully supported.

### Tally (`#`)
Calculates the length of an array or string:
```codon
len1 = # numbers      NB. const len1 = numbers.length;
len2 = # (10;20;30)   NB. const len2 = [10, 20, 30].length;
```

### Reciprocal (`%`)
Calculates the reciprocal `1 / x`:
```codon
quarter = % 4         NB. const quarter = 1 / 4;
```

### Square Root (`%:`)
Computes `Math.sqrt(x)`:
```codon
root = %: 25          NB. const root = Math.sqrt(25);
```

### Absolute Value (`|`)
Computes `Math.abs(x)`:
```codon
pos = | _10           NB. const pos = Math.abs(-10);
```

---

## 6. Tacit Trains & Higher-Order Verbs

Codon brings functional array combinators natively into JavaScript:

### Forks (`(fork f g h)` / `(f g h)`)
A 3-verb fork computes `g` applied to the results of `f` and `h`:
- Monadic: `(f g h) y = g(f(y), h(y))`
- Dyadic: `x (f g h) y = g(f(x, y), h(x, y))`

Classic Average Fork:
```codon
avg =: (fork sum div tally)
result =: (avg [10, 20, 30]) NB. sum([10,20,30]) / tally([10,20,30]) = 60 / 3 = 20
```

Transpiles to:
```javascript
const avg = fork(sum, div, tally);
const result = avg([10, 20, 30]);
```

### Hooks (`(hook f g)` / `(f g)`)
A 2-verb hook combines a binary function with a unary function:
- Monadic: `(f g) y = f(y, g(y))`
- Dyadic: `x (f g) y = f(x, g(y))`

```codon
triple =: (hook add double) NB. add(y, double(y)) = y + 2y = 3y
```

### Folds (`+/`, `*/`) & Scans (`+\`)
- **Sum Fold (`+/`)**:
  ```codon
  total =: +/ [1, 2, 3, 4]   NB. const total = sum([1, 2, 3, 4]);
  ```
- **Product Fold (`*/`)**:
  ```codon
  fact =: */ [1, 2, 3, 4, 5]  NB. const fact = product([1, 2, 3, 4, 5]);
  ```

---

## 7. Functions & Closures

### Named Function Declarations (`fn.` / `async_fn.`)

Named functions follow the standard `<word>. ... do. ... end.` block structure:

```codon
NB. Synchronous function
fn. add a,b do.
  return. (a + b)
end.

NB. Asynchronous function
async_fn. fetchUser id do.
  res =: @ (api.get id)
  return. res.data
end.
```

Transpiles to:
```javascript
function add(a, b) {
  return a + b;
}

async function fetchUser(id) {
  const res = await api.get(id);
  return res.data;
}
```

### Direct Definition Arrow Functions (`{{params => expr}}`)

Codon adapts J's direct definition delimiter `{{ ... }}` with arrow syntax for concise lambdas:

- **Expression Bodies**:
  ```codon
  double =: {{x => (x * 2)}}
  multiply =: {{a,b => (a * b)}}
  noArgs =: {{=> 'constant'}}
  ```
- **Block Bodies**:
  ```codon
  handler =: {{event => do.
    (event.preventDefault())
    (console.log event.target)
  end.}}
  ```
- **Async Arrows**:
  ```codon
  fetcher =: {{async url => @ (fetch url)}}
  ```
- **Parameter Destructuring**:
  ```codon
  getTitle =: {{({ title }) => title}}
  addPair =: {{[a, b] => (a + b)}}
  ```

### Anonymous Function Expressions (`{{fn ...}}`)

To emit `function(params) { ... }`:

```codon
(app.get '/health' {{fn req,res => do.
  (res.json O(status:'ok'))
end.}})
```

### Function Calls & Call Statements

Codon supports concise unparenthesized call statements at top-level / statement position as well as standard parenthesized expressions:

- **Unparenthesized Call Statements**: At statement level, outer parentheses can be omitted:
  ```codon
  console.log 'User logged in' user.id
  res.status 200
  app.use cors()
  new User 'Alice' 30
  ```
- **Expression Calls**: Inside expressions, wrap in parentheses:
  ```codon
  result =: (Math.max a b)
  ```

Transpiles to:
```javascript
console.log("User logged in", user.id);
res.status(200);
app.use(cors());
new User("Alice", 30);
const result = Math.max(a, b);
```

---

## 8. Classes & Object-Oriented Programming

### Class Declarations

```codon
class. Counter extends BaseCounter do.
  count =: 0

  constructor. initial=0 do.
    super. initial
    (this.count = initial)
  end.

  method. increment step=1 do.
    (this.count = (this.count + step))
    return. this.count
  end.

  async_method. syncServer do.
    @ (api.saveCount this.count)
  end.

  get. current do.
    return. this.count
  end.

  set. current val do.
    (this.count = val)
  end.
end.
```

### Class Expressions

Codon supports anonymous and named class expressions:

```codon
Counter =: (class. do.
  count =: 0
end.)

Dog =: (class. Canine extends Animal do.
  method. bark do.
    return. 'Woof'
  end.
end.)
```

---

## 9. Control Flow Structures

### Conditionals (`if.` / `elseif.` / `else.`)

```codon
if. (x === 1) do.
  (console.log 'one')
elseif. (x === 2) do.
  (console.log 'two')
else.
  (console.log 'other')
end.
```

### Loops (`while.`, `whilst.`, `for.`, `for_in.`, `for_of.`)

- **While Loop**:
  ```codon
  while. (n > 0) do.
    (n = n - 1)
  end.
  ```
- **For Loop (C-Style)**:
  ```codon
  for. i =: 0 ; (i < 10) ; (i++) do.
    (console.log i)
  end.
  ```
- **For-In Loop**:
  ```codon
  for_in. key : obj do.
    (console.log key (obj[key]))
  end.
  ```
- **For-Of Loop (with Destructuring)**:
  ```codon
  for_of. [key, value] : entries do.
    (console.log key value)
  end.
  ```

### Pattern Matching & Switch (`select.` / `case.`)

```codon
select. status
case. 'pending' do.
  (handlePending())
case. 'done' do.
  (handleDone())
else.
  (handleUnknown())
end.
```

### Exception Handling (`try.` / `catch.` / `finally.`)

```codon
try. do.
  (riskyCall())
catch. err do.
  (console.error err)
finally. do.
  (cleanup())
end.
```

### Jumps & Returns (`return.`, `throw.`)

```codon
return. result
return.
throw. (new Error 'Operation failed')
```

---

## 10. Modules & Imports/Exports

Codon uses native `import.` and `export.` control words for complete ECMAScript module support:

```codon
NB. Imports
import. express from 'express'
import. { useState, useEffect } from 'react'
import. React, { Component } from 'react'
import. * as fs from 'node:fs/promises'
import. { calculateAverage } from './utils/math.cdn'      NB. .cdn is rewritten to .js on compilation
import. config from './config.json' with { type: 'json' } NB. Import attributes
import. './styles.css'                                    NB. Side-effect asset import

NB. Re-Exports
export. * from './utils/math.cdn'
export. * as mathUtils from './utils/math.cdn'
export. { calculateAverage, sumVector as sum } from './utils/math.cdn'
export. { localHandler, config }

NB. Named & Default Exports
export. fn. helper do.
  return. true
end.

export. class. ApiClient do.
end.

export. default App

NB. Dynamic Imports
async_fn. loadPlugin name do.
  plugin =: @ (import `./plugins/${name}.cdn`)
  return. plugin
end.
```

For full multi-file application structure, `codon.json` configuration, and project-wide compilation with `codon build`, see the **[Projects Guide](PROJECTS.md)**.

---

## 11. React & JSX Support

Codon natively supports React and JSX elements, components, attributes, interpolations, and fragments:

```codon
fn. ChatApp props do.
  [messages, setMessages] =: (useState [])

  return. (
    <div className="chat-container">
      <h1>Chat Window</h1>
      <ul>
        {(messages.map {{msg => (
          <li key={msg.id}>
            <strong>{msg.user}: </strong>
            <span>{msg.text}</span>
          </li>
        )}})}
      </ul>
      <button onClick={{=> (setMessages [])}}>Clear</button>
    </div>
  )
end.
```

---

## 12. Subtree-Hashing Macros (`M!`)

Codon provides a first-class macro system replacing verbose recurring AST subtrees with compact invocations:

```codon
idx =: M!m_call_expr_11(items)
M!m_expression_stmt_17(Child;Parent)
capitalized =: M!m_binary_expr_32(word)
```

For the complete specification of the macro engine, wyhash matching, dictionary structure, and full catalog of 721 macros, see the **[Macros Guide](MACROS.md)**.
