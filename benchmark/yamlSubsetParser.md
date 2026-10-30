# Simple YAML Subset Parser
Create a simple indented YAML dictionary parser in a single file without external libraries.

Requirements:
- Export function `parseYaml(content: string): Record<string, any>`.
- Splits content into lines, ignoring blank lines and comments starting with `"#"`.
- Parses 2-space indented key-value pairs (`key: value` or `key:` followed by indented child keys).
- Converts values: integers/floats to numbers, `"true"`/`"false"` to booleans, `"null"` to null, otherwise string (stripping quotes).
- Constructs nested objects when indentation increases by 2 spaces.
- Returns resulting JavaScript object.
