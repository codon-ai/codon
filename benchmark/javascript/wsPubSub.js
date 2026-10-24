import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8081 });
const subscriptions = new Map();

wss.on("connection", (ws) => {
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      const { type, channel, data } = msg;

      if (type === "subscribe") {
        if (!subscriptions.has(channel)) subscriptions.set(channel, new Set());
        subscriptions.get(channel).add(ws);
      } else if (type === "unsubscribe") {
        subscriptions.get(channel)?.delete(ws);
      } else if (type === "publish") {
        const payload = JSON.stringify({ channel, data });
        for (const client of subscriptions.get(channel) || []) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        }
      }
    } catch {
      ws.send(JSON.stringify({ error: "Invalid message payload" }));
    }
  });

  ws.on("close", () => {
    for (const clients of subscriptions.values()) {
      clients.delete(ws);
    }
  });
});
