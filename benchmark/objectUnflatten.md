# Object Unflatten Utility
Create an object unflattening utility expanding dot-notation keys back into nested objects in a single file.

Requirements:
- Export function `unflattenObject(flat: Record<string, any>): Record<string, any>`.
- Maintain `result: Record<string, any> = {}`.
- Iterate `Object.entries(flat)`:
- Split key by `"."`: `const keys = fullKey.split(".")`.
- Traverse `result` creating nested objects for intermediate keys.
- Assign `value` to final key in the chain.
- Return `result`.
