export function parseCookies(header) {
  const res = {};
  if (!header) return res;
  for (const pair of header.split(";")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    res[trimmed.slice(0, eq).trim()] = decodeURIComponent(trimmed.slice(eq + 1).trim());
  }
  return res;
}
export function serializeCookie(name, value, options = {}) {
  let str = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (options.maxAge !== undefined) str += `; Max-Age=${options.maxAge}`;
  str += `; Path=${options.path || "/"}`;
  if (options.httpOnly) str += "; HttpOnly";
  if (options.secure) str += "; Secure";
  if (options.sameSite) str += `; SameSite=${options.sameSite}`;
  return str;
}
