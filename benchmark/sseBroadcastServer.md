# Server-Sent Events Broadcast Hub
Create a Server-Sent Events (SSE) server with client subscription and broadcast in a single file using node:http.

Requirements:
- Import `http` from `"node:http"`.
- Maintain `clients = new Set<http.ServerResponse>()`.
- Route `GET /events`: set headers `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`. Flush headers, add `res` to `clients`.
- On `res` close event: remove `res` from `clients`.
- Export function `broadcastEvent(event: string, data: unknown): void`: iterates `clients`, writing `event: ${event}
data: ${JSON.stringify(data)}

` to each.
- Route `POST /broadcast`: parse incoming JSON body `{ event, data }`, invoke `broadcastEvent(event, data)`, and respond `200 { sent: true, clientCount: clients.size }`.
- Listen on port 8083.
