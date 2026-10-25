# Attempts
A running log of all successful and failed optimization attempts.

## Revision 5a (successful)
- **Tokens:** 40000

- **Revision Idea**: Introduce concise module import and export declarations via J control words `import. specifiers from 'source'` and `export. declaration`, replacing verbose metadata comments `NB. i|D:...|N:...` and `NB. export\n`.
- **Rationale**: In fullstack AI development (React components, Express API servers, SQLite database modules, WebSocket servers, CLI utilities, test suites), ES module imports and exports exist at the top of virtually every file. Previously, Codon lacked native import syntax, encoding imports in pipe-separated comment strings (`NB. i|D:React:react|N:useState:react|N:useRef:react`) with colon specifiers and URL-encoded paths. Each import required heavy boilerplate, repeated module sources for each imported identifier, and consumed 15–25 tokens per module. Furthermore, exports relied on comment flags (`NB. export\n`). Adding `import.` and `export.` control words cleanly aligns ES modules with Codon's dot-inflected control word convention (`fn.`, `class.`, `if.`, `return.`):
  - Default import: `import. express from 'express'`
  - Named import: `import. {useState,useRef} from 'react'`
  - Default & named import: `import. React,{useState,useRef} from 'react'`
  - Namespace import: `import. * as fs from 'node:fs/promises'`
  - Side-effect import: `import. 'style.css'`
  - Export declaration: `export. fn. addTodo title do. ... end.` and `export. class. ApiClient do. ... end.`
  - Export default: `export. default expr`
  - Retains complete backward compatibility with legacy `NB. i|...`, `NB. export`, `NB. e|`, `NB. ex|`, and `NB. exAll|`.
- **Target Token Savings for Fullstack Applications**:
  - Drops import syntax overhead from 15–25 tokens down to 4–8 tokens per imported module.
  - Eliminates duplicate module source repetitions (e.g. `:react` repeated 3 times in `D:React:react|N:useState:react|N:useRef:react`).
  - Eliminates URL encoding of module paths (`node%3Afs/promises` -> `'node:fs/promises'`).
  - Cuts export overhead from `NB. export\n` (3 tokens) to `export. ` (1–2 tokens).
  - Eliminates 100% of comment metadata wrappers across all fullstack modules.
- **Concrete Syntax Changes**:
  - `JSToCodonTranslator`: Emits `import. ${specifiers} from '${src}'` for `ImportDeclaration`, and `export. ${declaration}` for `ExportNamedDeclaration`.
  - `CodonToASTParser`: Parses `import. ...` statements into ESTree `ImportDeclaration` nodes supporting default, named, combined, namespace, and side-effect forms with `from` or `:`. Parses `export. ...` declarations into `ExportNamedDeclaration` or `ExportDefaultDeclaration`.
  - Examples:
    - Old Codon: `NB. i|D:React:react|N:useState:react|N:useRef:react`
    - New Codon: `import. React,{useState,useRef} from 'react'`
    - Old Codon: `NB. i|D:fs:node%3Afs/promises|D:path:node%3Apath`
    - New Codon: `import. fs from 'node:fs/promises'\nimport. path from 'node:path'`
    - Old Codon: `NB. i|N:WebSocketServer:ws|N:WebSocket:ws`
    - New Codon: `import. {WebSocketServer,WebSocket} from 'ws'`
    - Old Codon: `NB. export\nfn. addTodo title do.`
    - New Codon: `export. fn. addTodo title do.`

## Revision 4a (successful)
- **Tokens:** 40000

- **Revision Idea**: Introduce concise function declarations via J control words `fn. name params do. ... end.` and `async_fn. name params do. ... end.`, replacing verbose metadata comments `{{ NB. FD|name|params\n...\n}}` and `{{ NB. async FD|name|params\n...\n}}`.
- **Rationale**: In fullstack AI development (React component definitions, Express/Next.js API route handlers and server actions, database queries and transactions, utility parsers, and test assertion helpers), named top-level and inner function declarations represent standard architectural units. Previously, Codon lacked a concise native statement form for function declarations, relying instead on comment annotations (`{{ NB. FD|name|params\n...\n}}` and `{{ NB. async FD|name|params\n...\n}}`). Each function declaration incurred 8–12 tokens of syntax and comment overhead (`{{`, `NB.`, `FD`, `|`, `name`, `|`, `params`, `}}`), which was inconsistent with Codon's J control structure convention. In Codon and standard J, statement-level blocks consistently follow the control word pattern `<verb>. ... do. ... end.` (such as `class.`, `method.`, `async_method.`, `constructor.`, `if.`, `for_of.`, `try.`, `while.`). Adding `fn.` and `async_fn.` seamlessly extends this idiom to function declarations:
  - Synchronous function declaration: `fn. name params do.\nstmts\nend.` (or parameterless `fn. name do.\nstmts\nend.`)
  - Asynchronous function declaration: `async_fn. name params do.\nstmts\nend.` (or parameterless `async_fn. name do.\nstmts\nend.`)
  - Direct definition naming: `{{fn name params => do.\nstmts\n}}`
  - Retains complete backward compatibility with legacy `{{ NB. FD|name|params\n...\n}}` and `{{ NB. async FD|...}}` definitions.
- **Target Token Savings for Fullstack Applications**:
  - Eliminates the comment prefix `NB.`, delimiter pipes `|`, and double brace enclosures `{{ ... }}`.
  - Drops syntax overhead from 8–12 tokens down to ~3–4 tokens (`fn.`, `do.`, `end.`).
  - Saves 5–8 tokens per function declaration across all modules and fullstack entrypoints.
  - Standardizes statement structure across methods, classes, and top-level functions, yielding smoother token prediction for LLMs.
- **Concrete Syntax Changes**:
  - `JSToCodonTranslator`: Emits `${prefix} ${header} do.\n${body}\nend.` where prefix is `fn.` or `async_fn.` and header is `${name}${params ? " " + params : ""}`.
  - `CodonToASTParser`: Registers `fn.` and `async_fn.` in statement splitting block openers. Parses `fn. name params do. ... end.` and `async_fn. name params do. ... end.` into ESTree `FunctionDeclaration` AST nodes. Also supports `{{fn name params => do. ... }}`.
  - Examples:
    - Old Codon: `{{ NB. FD|addTodo|title\nresult =: (insertStmt.run title)\nreturn. (Number result.lastInsertRowid)\n}}`
    - New Codon: `fn. addTodo title do.\nresult =: (insertStmt.run title)\nreturn. (Number result.lastInsertRowid)\nend.`
    - Old Codon: `{{ NB. async FD|scanDir|dir,extension\nentries =: @ (fs.readdir dir O(withFileTypes:true))\n...\n}}`
    - New Codon: `async_fn. scanDir dir,extension do.\nentries =: @ (fs.readdir dir O(withFileTypes:true))\n...\nend.`
    - Old Codon: `{{ NB. FD|ChatApp|\n[messages,setMessages] =: (useState (,O(id:1;user:'Alice';text:'Hello world!')))\n...\n}}`
    - New Codon: `fn. ChatApp do.\n[messages,setMessages] =: (useState (,O(id:1;user:'Alice';text:'Hello world!')))\n...\nend.`

## Revision 3a (successful)
- **Tokens:** 40000

- **Revision Idea**: Introduce concise direct definition syntax `{{params => body}}`, `{{async params => body}}`, and `{{fn params => do. ... end.}}` for arrow functions and anonymous function expressions in Codon, eliminating verbose `({{ NB. pE|... }})`, `({{ NB. pB|... }})`, and `({{ NB. FE|... }})` comments.
- **Rationale**: In fullstack AI development (Express/Koa route handlers, asynchronous Promise chains, WebSocket message/connection listeners, array transformation pipelines `.map`/`.filter`, React hooks and state updaters), closures and arrow functions are ubiquitous. Previously, Codon lacked a direct lambda parameter syntax, relying on metadata comments (`({{ NB. pE|params\nexpr\n}})` for expression bodies, `({{ NB. pB|params\nstmts\n}})` for block bodies, and `({{ NB. FE|params\nstmts\n}})` for function expressions). Each closure consumed 10–14 tokens of boilerplate wrapper tokens (`(`, `{{`, `NB.`, `pE|`, newline, `}}`, `)`). The new syntax leverages J's native direct definition delimiter `{{ ... }}` with concise arrow notation:
  - Expression arrow function: `{{params => expr}}`
  - Block arrow function: `{{params => do.\nstmts\nend.}}`
  - Anonymous function expression: `{{fn params => do.\nstmts\nend.}}`
  - Async forms: `{{async params => expr}}` and `{{async params => do.\nstmts\nend.}}`
  - Parameterless closures: `{{=> expr}}` and `{{() => expr}}`
  - Retains complete backward compatibility with legacy `({{ NB. pE|... }})`, `({{ NB. pB|... }})`, and `({{ NB. FE|... }})` forms.
- **Target Token Savings for Fullstack Applications**:
  - Eliminates the comment prefix `NB. pE|`, `NB. pB|`, `NB. FE|` and redundant wrapping parentheses.
  - Cuts wrapper token overhead per arrow function from 10–14 tokens down to ~3 tokens (`{{`, `=>`, `}}`), a 50–70% token reduction per closure.
  - Significantly compresses high-density fullstack pipelines (such as nested `.map().filter()` chains in CSV parsing, Express request handlers, and async task runner callbacks).
- **Concrete Syntax Changes**:
  - `JSToCodonTranslator`: Emits `{{${asyncPrefix}${pStr} => ${expr}}}` for expression arrow functions, `{{${asyncPrefix}${pStr} => do.\n${body}\nend.}}` for block arrow functions, and `{{${asyncPrefix}fn ${feParams} => do.\n${body}\nend.}}` for function expressions.
  - `CodonToASTParser`: Parses `{{... => ...}}` in `parseExpression` using `splitFirstAtLevel(inner, "=>")`, extracting `async` modifier, function type (`fn`/`function` vs arrow), parameters, and distinguishing expression vs `do. ... end.` block bodies into ESTree `ArrowFunctionExpression` or `FunctionExpression` AST nodes.
  - Examples:
    - Old Codon: `delay =: ({{ NB. pE|ms\n(new Promise ({{ NB. pE|resolve\n(setTimeout resolve ms)\n}}))\n}})`
    - New Codon: `delay =: {{ms => (new Promise {{resolve => (setTimeout resolve ms)}})}}`
    - Old Codon: `(app.get '/' ({{ NB. FE|_,res\n(res.json O(counter))\n}}))`
    - New Codon: `(app.get '/' {{fn _,res => do.\n(res.json O(counter))\nend.}})`
    - Old Codon: `((rows.map ({{ NB. pE|line\n((line.split ',').map ({{ NB. pE|cell\ncell.trim()\n}}))\n}})))`
    - New Codon: `((rows.map {{line => ((line.split ',').map {{cell => cell.trim()}})}}))`

## Revision 2a (successful)
- **Tokens:** 40000

- **Revision Idea**: Introduce concise colon key-value pairs (`key:value`), identifier shorthand properties (`prop`), and direct prefix spread (`...expr`) in Codon object expressions `O(...)`.
- **Rationale**: In fullstack AI development (REST/GraphQL API endpoints, Express route handlers, React state/props, database ORM queries, WebSocket payloads, and HTTP request headers/options), object literals are among the most frequently generated structures. Previously, Codon required alternating quoted keys and values separated by semicolons (`O('key';value;'key2';value2)`) and lacked property shorthand. This forced repetitive token emissions like `O('counter';counter)` and `O('id';id;'title';title)`. The new syntax enables:
  - Unquoted identifier keys with colon syntax: `O(key:val;key2:val2)`.
  - Property shorthand: `O(prop1;prop2)` which transpiles directly to `{ prop1, prop2 }`.
  - Direct prefix spread: `O(...rest;headers:h)` instead of `'...';rest`.
  - Empty object syntax: `O()` alongside `O''`.
  - Retaining complete backward compatibility with legacy alternating `O('key';val)` definitions.
- **Target Token Savings for Fullstack Applications**:
  - Eliminates quotes and semicolon separators on property names (saving 2 tokens per property).
  - Shorthand eliminates duplicate identifier and value emissions (saving 40-50% tokens per shorthand property).
  - Prefix spread eliminates quoted `'...'` token pairs.
  - Reduces object construction tokens across all fullstack benchmark suites by 35-50%.
- **Concrete Syntax Changes**:
  - `JSToCodonTranslator`: Emits `key` for shorthand properties, `key:val` for identifier properties, `...arg` for spreads, and `O()` for empty objects.
  - `CodonToASTParser`: Parses `key:val`, identifier shorthand `prop`, `...expr`, `O()`, and legacy `O('key';val)` into ESTree `ObjectExpression` AST nodes.
  - Examples:
    - Old Codon: `(res.json O('counter';counter))`
    - New Codon: `(res.json O(counter))`
    - Old Codon: `payload =: (JSON.stringify O('channel';channel;'data';data))`
    - New Codon: `payload =: (JSON.stringify O(channel;data))`
    - Old Codon: `response =: @ (fetch url O('...';rest;'headers';O('Content-Type';'application/json')))`
    - New Codon: `response =: @ (fetch url O(...rest;headers:O('Content-Type':'application/json')))`

## Revision 1a (successful)
- **Tokens:** 40000

- **Revision Idea**: Introduce `@` and `@:` as prefix monadic await verbs in Codon, replacing verbose parenthesized `(await expr)` syntax with compact J-style monadic verb notation.
- **Rationale**: In fullstack AI development (API routes, database queries, network requests, background job queues, and async state initialization), `await` expressions are heavily used. In the current Codon implementation, awaiting required `(await expr)`, consuming 4+ tokens per await expression (`(`, `await`, space, `)`). In J syntax, monadic verbs (`#`, `%`, `%:`, `|`) operate directly on their right-hand argument. Introducing `@` and `@:` provides an idiomatic, ultra-concise prefix await operator that eliminates boilerplate tokens.
- **Target Token Savings for Fullstack Applications**:
  - Replaces the 5-character keyword `await` and outer parentheses with a 1-character token `@` (or `@:`).
  - Cuts token usage for async calls by ~50% to 75% per await expression (from 4 tokens down to 1–2 tokens).
  - Multiplies across real-world fullstack workflows with nested fetches, database calls, and async loop iterations.
- **Concrete Syntax Changes**:
  - `JSToCodonTranslator`: Emits `(@ <arg>)` for `AwaitExpression` instead of `(await <arg>)`.
  - `CodonToASTParser`: Parses `@ expr`, `@expr`, `@: expr`, `(@ expr)`, as well as legacy `(await expr)` into `AwaitExpression` nodes.
  - Examples:
    - Old Codon: `response =: (await (fetch url.toString()))`
    - New Codon: `response =: (@ (fetch url.toString()))` or `response =: @ (fetch url.toString())`