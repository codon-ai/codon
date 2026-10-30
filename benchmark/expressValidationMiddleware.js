export function validateBody(schema) {
  return (req, res, next) => {
    const body = req.body || {};
    const errors = [];
    for (const [field, rule] of Object.entries(schema)) {
      if (rule.required && (body[field] === undefined || body[field] === null)) {
        errors.push(`Field "${field}" is required`);
        continue;
      }
      if (body[field] !== undefined && body[field] !== null) {
        const val = body[field];
        let valid = false;
        if (rule.type === "array") valid = Array.isArray(val);
        else if (rule.type === "object") valid = typeof val === "object" && !Array.isArray(val);
        else valid = typeof val === rule.type;
        if (!valid) errors.push(`Field "${field}" must be of type ${rule.type}`);
      }
    }
    if (errors.length > 0) return res.status(400).json({ errors });
    next();
  };
}
