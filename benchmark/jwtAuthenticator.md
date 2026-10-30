# Minimal JWT Signer and Verifier
Create a minimal JSON Web Token (JWT) HMAC-SHA256 signer and verifier using node:crypto in a single file.

Requirements:
- Import `crypto` from `"node:crypto"`.
- Helper `base64url(str: Buffer | string): string` converts to URL-safe base64 (replacing `+` with `-`, `/` with `_`, removing `=`).
- Export function `signJwt(payload: Record<string, any>, secret: string): string`.
- Encodes header `{"alg":"HS256","typ":"JWT"}` and JSON `payload` in base64url. Computes HMAC-SHA256 signature over `${encodedHeader}.${encodedPayload}` using secret. Returns `${encodedHeader}.${encodedPayload}.${signature}`.
- Export function `verifyJwt(token: string, secret: string): Record<string, any> | null`.
- Splits token into 3 parts. Recomputes expected signature over `${part0}.${part1}`. Uses `crypto.timingSafeEqual` to verify. Returns parsed payload JSON if valid, or `null` if signature is invalid or token malformed.
