function expandField(field, min, max) {
  const values = new Set();
  const parts = field.split(",");
  for (const part of parts) {
    if (part === "*") {
      for (let i = min; i <= max; i++) values.add(i);
    } else if (part.startsWith("*/")) {
      const step = parseInt(part.slice(2), 10);
      for (let i = min; i <= max; i += step) values.add(i);
    } else if (part.includes("-")) {
      const [rangePart, stepPart] = part.split("/");
      const [start, end] = rangePart.split("-").map(Number);
      const step = stepPart ? parseInt(stepPart, 10) : 1;
      for (let i = start; i <= end; i += step) values.add(i);
    } else {
      values.add(parseInt(part, 10));
    }
  }
  return Array.from(values).sort((a, b) => a - b);
}

export function parseCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression");
  }
  return {
    minutes: expandField(parts[0], 0, 59),
    hours: expandField(parts[1], 0, 23),
    daysOfMonth: expandField(parts[2], 1, 31),
    months: expandField(parts[3], 1, 12),
    daysOfWeek: expandField(parts[4], 0, 6),
  };
}
