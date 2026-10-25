export function parseCookies(header) {
  if (!header) return {};
  const cookies = {};
  const pairs = header.split(";");
  for (const pair of pairs) {
    const trimmed = pair.trim();
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = decodeURIComponent(trimmed.slice(0, eqIdx).trim());
      const val = decodeURIComponent(trimmed.slice(eqIdx + 1).trim());
      cookies[key] = val;
    }
  }
  return cookies;
}

export function serializeCookie(name, value, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }
  cookie += `; Path=${options.path || "/"}`;
  if (options.httpOnly) {
    cookie += "; HttpOnly";
  }
  if (options.secure) {
    cookie += "; Secure";
  }
  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }
  return cookie;
}
