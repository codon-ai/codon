import http from "node:http";

const clients = new Set();

export function broadcastEvent(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    clients.add(res);
    req.on("close", () => {
      clients.delete(res);
    });
    return;
  }

  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const { event, data } = JSON.parse(body);
        broadcastEvent(event, data);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ sent: true, clientCount: clients.size }));
      } catch {
        res.writeHead(400).end();
      }
    });
    return;
  }

  res.writeHead(404).end();
});

server.listen(8083);
