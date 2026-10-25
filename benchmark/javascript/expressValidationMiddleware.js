export function validateBody(schema) {
  return function (req, res, next) {
    const body = req.body || {};
    const errors = [];

    for (const [field, rule] of Object.entries(schema)) {
      const val = body[field];
      if (rule.required && (val === undefined || val === null)) {
        errors.push(`Field "${field}" is required`);
        continue;
      }
      if (val !== undefined && val !== null) {
        if (rule.type === "array") {
          if (!Array.isArray(val)) {
            errors.push(`Field "${field}" must be of type array`);
          }
        } else if (typeof val !== rule.type) {
          errors.push(`Field "${field}" must be of type ${rule.type}`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    next();
  };
}
