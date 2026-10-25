import { WebSocket } from "ws";

export class ReconnectingWebSocket {
  constructor(url, maxRetries = 5, baseDelayMs = 1000) {
    this.url = url;
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
    this.socket = null;
    this.retryCount = 0;
    this.isClosedManually = false;
    this.messageListeners = [];
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.on("open", () => {
      this.retryCount = 0;
    });

    this.socket.on("message", (data) => {
      const msg = String(data);
      for (const cb of this.messageListeners) {
        cb(msg);
      }
    });

    this.socket.on("close", () => {
      if (!this.isClosedManually && this.retryCount < this.maxRetries) {
        const delay = this.baseDelayMs * Math.pow(2, this.retryCount++);
        setTimeout(() => this.connect(), delay);
      }
    });
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  onMessage(cb) {
    this.messageListeners.push(cb);
  }

  close() {
    this.isClosedManually = true;
    if (this.socket) {
      this.socket.close();
    }
  }
}
