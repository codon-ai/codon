export class ApiClient {
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  async request(endpoint, options = {}) {
    const { params, headers, ...rest } = options;
    const url = new URL(endpoint, this.baseUrl);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url.toString(), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...this.defaultHeaders,
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  get(endpoint, params) {
    return this.request(endpoint, { method: "GET", params });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}
