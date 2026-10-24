# Attempts
A running log of all successful and failed optimization attempts.

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