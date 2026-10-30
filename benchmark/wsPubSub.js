import { WebSocketServer, WebSocket } from "ws";
const wss = new WebSocketServer({ port: 8081 });
const channels = new Map();
wss.on("connection", ws => {
  ws.on("message", message => {
    try {
      const { type, channel, data } = JSON.parse(message);
      if (type === "subscribe") {
        if (!channels.has(channel)) channels.set(channel, new Set());
        channels.get(channel).add(ws);
      } else if (type === "unsubscribe") {
        channels.get(channel)?.delete(ws);
      } else if (type === "publish") {
        const payload = JSON.stringify({ channel, data });
        for (const client of channels.get(channel) || []) {
          if (client.readyState === WebSocket.OPEN) client.send(payload);
        }
      }
    } catch {
      ws.send(JSON.stringify({ error: "Invalid message payload" }));
    }
  });
  ws.on("close", () => {
    for (const set of channels.values()) set.delete(ws);
  });
});
