# Attempts
A running log of all successful and failed optimization attempts.

## Revision 1a (successful)

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