function expandField(field, min, max) {
  const values = new Set();
  for (const part of field.split(",")) {
    if (part.includes("/")) {
      const [sub, stepStr] = part.split("/");
      const step = parseInt(stepStr, 10);
      let start = min, end = max;
      if (sub !== "*") {
        if (sub.includes("-")) [start, end] = sub.split("-").map(Number);
        else start = Number(sub);
      }
      for (let i = start; i <= end; i += step) values.add(i);
    } else if (part.includes("-")) {
      const [start, end] = part.split("-").map(Number);
      for (let i = start; i <= end; i++) values.add(i);
    } else if (part === "*") {
      for (let i = min; i <= max; i++) values.add(i);
    } else {
      values.add(Number(part));
    }
  }
  return Array.from(values).sort((a, b) => a - b);
}
export function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Invalid cron expression");
  return {
    minutes: expandField(parts[0], 0, 59),
    hours: expandField(parts[1], 0, 23),
    daysOfMonth: expandField(parts[2], 1, 31),
    months: expandField(parts[3], 1, 12),
    daysOfWeek: expandField(parts[4], 0, 6)
  };
}
