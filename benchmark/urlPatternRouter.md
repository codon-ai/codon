# URL Pattern Router
Create a URL pattern matching router extracting dynamic path parameters in a single file.

Requirements:
- Export interface `RouteMatch<T> { handler: T; params: Record<string, string>; }`.
- Export class `UrlRouter<T>`: maintain array of routes with regex and param names.
- Method `add(pattern: string, handler: T): void`: parses pattern like `"/users/:id/posts/:slug"`. Converts parameterized segments into regex `([^/]+)` capturing group, saves parameter names in order.
- Method `match(pathname: string): RouteMatch<T> | null`: tests pathname against registered regexes. On match, extracts captured group values into `params` record and returns `{ handler, params }`. If no match, returns `null`.
