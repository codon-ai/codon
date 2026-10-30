export class ApiClient {
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }
  async request(endpoint, options = {}) {
    const url = new URL(endpoint, this.baseUrl);
    if (options.params) {
      for (const [k, v] of Object.entries(options.params)) url.searchParams.set(k, String(v));
    }
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...this.defaultHeaders, ...options.headers }
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    return res.json();
  }
  get(endpoint, params) { return this.request(endpoint, { method: "GET", params }); }
  post(endpoint, body) { return this.request(endpoint, { method: "POST", body: JSON.stringify(body) }); }
}
