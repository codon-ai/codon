# WebSocket Pub/Sub Server
Create a real-time pub/sub broker in a single file using the "ws" library.

Requirements:
- Create a `WebSocketServer` listening on port `8081`.
- Track subscriptions using a `Map<string, Set<WebSocket>>()`.
- On connection, listen for `"message"` events parsing JSON with shape `{ type: "subscribe" | "unsubscribe" | "publish", channel: string, data?: unknown }`:
  - `"subscribe"`: add client socket to channel's Set.
  - `"unsubscribe"`: delete client socket from channel's Set.
  - `"publish"`: broadcast JSON string `{ channel, data }` to all clients in that channel whose `readyState === WebSocket.OPEN`.
  - Catch JSON parse errors and reply with `{ error: "Invalid message payload" }`.
- On socket `"close"` event: remove the socket from all channel sets in the map.
