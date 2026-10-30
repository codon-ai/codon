export function markdownToHtml(md) {
  const lines = md.split("\n");
  const parsed = lines.map(line => {
    let l = line;
    if (l.startsWith("### ")) return `<h3>${l.slice(4)}</h3>`;
    if (l.startsWith("## ")) return `<h2>${l.slice(3)}</h2>`;
    if (l.startsWith("# ")) return `<h1>${l.slice(2)}</h1>`;
    l = l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    l = l.replace(/\*(.+?)\*/g, "<em>$1</em>");
    l = l.replace(/`(.+?)`/g, "<code>$1</code>");
    l = l.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    if (l.trim().length > 0 && !l.startsWith("<h")) return `<p>${l}</p>`;
    return l;
  });
  return parsed.join("\n");
}
