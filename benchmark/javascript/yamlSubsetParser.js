function parseValue(val) {
  const trimmed = val.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (!isNaN(Number(trimmed)) && trimmed !== "") return Number(trimmed);
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseYaml(content) {
  const lines = content
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"));
  const root = {};
  const stack = [{ indent: -1, obj: root }];

  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const rest = trimmed.slice(colonIdx + 1).trim();

    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const current = stack[stack.length - 1].obj;

    if (rest === "") {
      const childObj = {};
      current[key] = childObj;
      stack.push({ indent, obj: childObj });
    } else {
      current[key] = parseValue(rest);
    }
  }

  return root;
}
