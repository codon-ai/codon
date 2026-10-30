# Signed Webhook Dispatcher
Create a secure webhook dispatcher signing payloads with HMAC-SHA256 in a single file.

Requirements:
- Import `crypto` from `"node:crypto"`.
- Export class `WebhookDispatcher`: constructor accepts `secret: string`.
- Method `computeSignature(payload: string): string`: computes HMAC-SHA256 hex digest of `payload` with `this.secret`.
- Method `async dispatch(targetUrl: string, eventName: string, data: unknown): Promise<{ status: number; ok: boolean }>`.
- Constructs JSON body string `JSON.stringify({ event: eventName, data, timestamp: Date.now() })`.
- Computes signature and dispatches `fetch(targetUrl, { method: "POST", headers: { "Content-Type": "application/json", "X-Webhook-Signature": signature, "X-Webhook-Event": eventName }, body })`.
- Returns `{ status: response.status, ok: response.ok }`.
