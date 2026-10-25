export function markdownToHtml(md) {
  const lines = md.split("\n");
  const processed = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    let parsed = trimmed;
    let isHeader = false;

    if (parsed.startsWith("### ")) {
      parsed = "<h3>" + parsed.slice(4) + "</h3>";
      isHeader = true;
    } else if (parsed.startsWith("## ")) {
      parsed = "<h2>" + parsed.slice(3) + "</h2>";
      isHeader = true;
    } else if (parsed.startsWith("# ")) {
      parsed = "<h1>" + parsed.slice(2) + "</h1>";
      isHeader = true;
    }

    parsed = parsed.replace(new RegExp("\\*\\*(.*?)\\*\\*", "g"), "<strong>$1</strong>");
    parsed = parsed.replace(new RegExp("\\*(.*?)\\*", "g"), "<em>$1</em>");
    parsed = parsed.replace(new RegExp("`([^`]+)`", "g"), "<code>$1</code>");
    parsed = parsed.replace(new RegExp("\\[([^\\]]+)\\]\\(([^\\)]+)\\)", "g"), '<a href="$2">$1</a>');

    if (!isHeader && !parsed.startsWith("<h")) {
      parsed = "<p>" + parsed + "</p>";
    }

    processed.push(parsed);
  }

  return processed.join("\n");
}
