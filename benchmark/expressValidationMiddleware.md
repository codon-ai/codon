# Express Request Body Validator
Create a schema validation middleware for Express request bodies in a single file.

Requirements:
- Type `FieldType = "string" | "number" | "boolean" | "array" | "object"`.
- Export interface `ValidationSchema { [field: string]: { type: FieldType; required?: boolean }; }`.
- Export function `validateBody(schema: ValidationSchema)`.
- Middleware inspects `req.body` (assume parsed JSON).
- Collect validation error strings into an array `errors: string[]`.
- Check required fields: if field is missing, push `Field "${field}" is required`.
- Check types for present fields: validate against `typeof` (or `Array.isArray` for `"array"`). If mismatched, push `Field "${field}" must be of type ${rule.type}`.
- If `errors.length > 0`, return `res.status(400).json({ errors })`; otherwise call `next()`.
