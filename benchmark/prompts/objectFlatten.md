# Object Flatten Utility
Create a recursive object flattening utility producing dot-notation keys in a single file.

Requirements:
- Export function `flattenObject(obj: Record<string, any>, prefix: string = ""): Record<string, any>`.
- Maintain `result: Record<string, any> = {}`.
- Iterate `Object.keys(obj)`:
- Compute `keyName = prefix ? `${prefix}.${k}` : k`.
- If value is non-null object, not an array, not a Date, and has keys: recursively call `flattenObject(val, keyName)` and merge into `result`.
- Otherwise assign `result[keyName] = val`.
- Return `result`.
