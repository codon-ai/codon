export function validate(schema, data) {
  const errors = [];

  for (const [field, rule] of Object.entries(schema)) {
    const val = data[field];

    if (rule.required && (val === undefined || val === null)) {
      errors.push(`Field "${field}" is required`);
      continue;
    }

    if (val !== undefined && val !== null) {
      if (typeof val !== rule.type) {
        errors.push(`Field "${field}" must be of type ${rule.type}`);
      } else if (rule.type === "number") {
        if (rule.min !== undefined && val < rule.min) {
          errors.push(`Field "${field}" must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && val > rule.max) {
          errors.push(`Field "${field}" must be at most ${rule.max}`);
        }
      } else if (rule.type === "string") {
        if (rule.min !== undefined && val.length < rule.min) {
          errors.push(`Field "${field}" length must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && val.length > rule.max) {
          errors.push(`Field "${field}" length must be at most ${rule.max}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
