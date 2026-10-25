# Mini GraphQL Query Dispatcher
Create a minimal GraphQL-style query parser and resolver dispatcher in a single file without external libraries.

Requirements:
- Type `Resolver = (args: Record<string, string | number>) => any`.
- Export class `MiniGraphQL`: maintain `resolvers = new Map<string, Resolver>()`.
- Method `register(field: string, resolver: Resolver): void`: registers resolver function.
- Method `async execute(query: string): Promise<{ data: Record<string, any>; errors?: string[] }>`.
- Parse queries formatted like `{ fieldName(arg1: "val", arg2: 123) }` or `{ fieldName }`.
- Extract field name and key-value arguments.
- Execute registered resolver with extracted arguments and return `{ data: { [fieldName]: result } }`.
- If resolver is not found, return `{ data: {}, errors: ["Field \"${fieldName}\" not found"] }`.
