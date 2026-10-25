# HTTP Cookie Parser and Serializer
Create an HTTP cookie parser and Set-Cookie header serializer in a single file.

Requirements:
- Export function `parseCookies(header: string): Record<string, string>`.
- Splits header by `";"`, trims pairs, splits at first `"="`, decodes with `decodeURIComponent`, and returns key-value record.
- Export interface `CookieOptions { maxAge?: number; httpOnly?: boolean; secure?: boolean; sameSite?: "Strict" | "Lax" | "None"; path?: string; }`.
- Export function `serializeCookie(name: string, value: string, options: CookieOptions = {}): string`.
- Encodes `name` and `value`. Appends `; Max-Age=${options.maxAge}`, `; Path=${options.path || "/"}`, `; HttpOnly` (if true), `; Secure` (if true), `; SameSite=${options.sameSite}` (if provided). Returns complete header string.
