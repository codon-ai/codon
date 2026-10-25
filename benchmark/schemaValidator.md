# Object Schema Validator
Create a lightweight object schema validation engine in a single file.

Requirements:
- Type `Rule = { type: "string" | "number" | "boolean"; required?: boolean; min?: number; max?: number; }`.
- Export type `Schema = Record<string, Rule>`.
- Export interface `ValidationResult { isValid: boolean; errors: string[]; }`.
- Export function `validate(schema: Schema, data: Record<string, any>): ValidationResult`.
- Check each field in schema: if `rule.required` and `data[field] == null`, record error `Field "${field}" is required`.
- If field is present: check `typeof data[field] === rule.type`. If mismatched, record error `Field "${field}" must be of type ${rule.type}`.
- If number: check `min` (value >= min) and `max` (value <= max). If string: check `min` (length >= min) and `max` (length <= max).
- Return `{ isValid: errors.length === 0, errors }`.
