export function parseYaml(content) {
  const parseVal = v => {
    v = v.trim();
    if (v === "true") return true;
    if (v === "false") return false;
    if (v === "null") return null;
    if (!isNaN(Number(v)) && v !== "") return Number(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
    return v;
  };
  const lines = content.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
  const root = {};
  const stack = [{ indent: -1, obj: root }];
  for (const line of lines) {
    const indent = line.search(/\S/);
    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(":");
    const key = trimmed.slice(0, colonIdx).trim();
    const valStr = trimmed.slice(colonIdx + 1).trim();
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    if (valStr) {
      parent[key] = parseVal(valStr);
    } else {
      parent[key] = {};
      stack.push({ indent, obj: parent[key] });
    }
  }
  return root;
}
