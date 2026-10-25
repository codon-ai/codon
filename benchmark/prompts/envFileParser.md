# Dotenv File Parser
Create a .env file parser in a single file without external libraries.

Requirements:
- Export function `parseEnv(content: string): Record<string, string>`.
- Maintain `result: Record<string, string> = {}`.
- Split content into lines. For each line, trim whitespace.
- Skip empty lines and lines starting with `"#"` (comments).
- Find first index of `"="`. If `-1`, skip line.
- Extract `key = line.slice(0, eqIndex).trim()`.
- Extract `value = line.slice(eqIndex + 1).trim()`.
- If value is enclosed in matching double quotes (`"..."`) or single quotes (`'...'`), strip the quotes.
- Unescape `\n` to newline character and `\t` to tab character.
- Assign `result[key] = value` and return `result`.
