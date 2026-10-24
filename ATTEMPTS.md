# Attempts
A running log of all successful and failed optimization attempts.

## Revision 3a (successful)

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
- **Tokens:** 653

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
- **Tokens:** 1639

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