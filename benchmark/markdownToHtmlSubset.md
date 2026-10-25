# Minimal Markdown to HTML Parser
Create a regex-based markdown-to-HTML parser in a single file without external libraries.

Requirements:
- Export function `markdownToHtml(md: string): string`.
- Converts headers: `### text` -> `<h3>text</h3>`, `## text` -> `<h2>text</h2>`, `# text` -> `<h1>text</h1>`.
- Converts bold: `**text**` -> `<strong>text</strong>`.
- Converts italic: `*text*` -> `<em>text</em>`.
- Converts inline code: `` `code` `` -> `<code>code</code>`.
- Converts links: `[text](url)` -> `<a href="url">text</a>`.
- Wraps non-empty lines that do not start with HTML tags in `<p>text</p>`.
- Returns resulting HTML string.
