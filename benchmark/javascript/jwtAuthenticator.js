import crypto from "node:crypto";
function base64url(str) {
  const buf = Buffer.isBuffer(str) ? str : Buffer.from(str);
  return buf.toString("base64url");
}
export function signJwt(payload, secret) {
  const encodedHeader = base64url(JSON.stringify({
    alg: "HS256",
    typ: "JWT"
  }));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}
export function verifyJwt(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const data = `${parts[0]}.${parts[1]}`;
  const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  const sigBuf = Buffer.from(parts[2]);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const payloadStr = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payloadStr);
  } catch (err) {
    return null;
  }
}