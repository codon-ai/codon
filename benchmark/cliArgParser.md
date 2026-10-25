# CLI Argument Parser
Create a command-line argument parser in a single file without external dependencies.

Requirements:
- Export interface `ParsedArgs { flags: Record<string, boolean>; options: Record<string, string>; positional: string[]; }`.
- Export function `parseArgs(argv: string[]): ParsedArgs`.
- Initialize `flags: Record<string, boolean> = {}`, `options: Record<string, string> = {}`, `positional: string[] = []`.
- Iterate through argument tokens:
- If argument starts with `"--"`: if it contains `"="` (e.g. `"--key=value"`), extract key and value into `options`. If no `"="`, check next token: if next token exists and does not start with `"-"`, consume it as option value; otherwise set key as `true` in `flags`.
- If argument starts with `"-"` (short flag e.g. `"-v"` or `"-f"`): set flag to `true`.
- Otherwise, append argument to `positional`.
- Return `{ flags, options, positional }`.
