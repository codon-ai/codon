# Reconnecting WebSocket Client
Create an auto-reconnecting WebSocket client wrapper in a single file using ws.

Requirements:
- Import `{ WebSocket }` from `"ws"`.
- Export class `ReconnectingWebSocket`: constructor takes `url: string`, `maxRetries: number = 5`, `baseDelayMs: number = 1000`.
- Maintain `socket: WebSocket | null = null`, `retryCount: number = 0`, `isClosedManually: boolean = false`, `messageListeners: Array<(data: string) => void> = []`.
- Method `connect(): void`: instantiates `new WebSocket(this.url)`. On `"open"`, reset `retryCount = 0`. On `"message"`, dispatch to `messageListeners`. On `"close"`, if `!isClosedManually && retryCount < maxRetries`, schedule reconnect with delay `baseDelayMs * Math.pow(2, retryCount++)`.
- Method `send(data: string): void`: sends data if socket is open.
- Method `onMessage(cb: (data: string) => void): void`: registers listener.
- Method `close(): void`: sets `isClosedManually = true` and closes socket.
