# HTTP Keep-Alive Connection Pool Client
Create an HTTP client configuring keep-alive connection pooling in a single file.

Requirements:
- Import `http` from `"node:http"`.
- Export function `createKeepAliveAgent(maxSockets: number = 10, keepAliveMsecs: number = 30000): http.Agent`.
- Returns `new http.Agent({ keepAlive: true, maxSockets, keepAliveMsecs })`.
- Export function `getWithAgent(urlStr: string, agent: http.Agent): Promise<{ statusCode: number; body: string }>`.
- Dispatches `http.get(url, { agent }, (res) => { ... })`. Accumulates response body data chunks. Resolves with `{ statusCode: res.statusCode || 200, body }`. Rejects on request error.
