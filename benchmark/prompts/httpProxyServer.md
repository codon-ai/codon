# HTTP Reverse Proxy Server
Create a lightweight HTTP reverse proxy server in a single file using node:http without external libraries.

Requirements:
- Import `http` from `"node:http"`.
- Export function `createProxyServer(targetHost: string, targetPort: number): http.Server`.
- Proxy server listens for incoming HTTP requests.
- For each client request, dispatch `http.request` to `targetHost` and `targetPort` preserving `req.method`, `req.url`, and `req.headers` (updating `headers.host = ${targetHost}:${targetPort}`).
- Pipe `req` into the proxy request.
- When target responds, write `proxyRes.statusCode` and `proxyRes.headers` to client response, and pipe `proxyRes` into `res`.
- Handle proxy error by responding `res.writeHead(502, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "Bad Gateway" }))`.
