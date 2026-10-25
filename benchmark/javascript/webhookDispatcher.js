import crypto from "node:crypto";

export class WebhookDispatcher {
  constructor(secret) {
    this.secret = secret;
  }

  computeSignature(payload) {
    return crypto
      .createHmac("sha256", this.secret)
      .update(payload)
      .digest("hex");
  }

  async dispatch(targetUrl, eventName, data) {
    const body = JSON.stringify({
      event: eventName,
      data,
      timestamp: Date.now(),
    });
    const signature = this.computeSignature(body);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
        "X-Webhook-Event": eventName,
      },
      body,
    });

    return {
      status: response.status,
      ok: response.ok,
    };
  }
}
