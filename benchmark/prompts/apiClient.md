# Typed HTTP API Client
Create a typed HTTP API client class in a single file using the standard global `fetch`.

Requirements:
- Export interface `RequestOptions extends RequestInit` with optional `params?: Record<string, string | number>`.
- Export class `ApiClient`:
  - Constructor accepts `baseUrl: string` and optional `defaultHeaders: Record<string, string> = {}`.
  - Private async method `request<T>(endpoint: string, options: RequestOptions = {}): Promise<T>`:
    - Resolves URL with `new URL(endpoint, this.baseUrl)`.
    - Serializes `options.params` onto `url.searchParams`.
    - Calls `fetch` with merged headers: default `"Content-Type": "application/json"`, `this.defaultHeaders`, and `options.headers`.
    - Throws `new Error(\`HTTP Error \${response.status}: \${response.statusText}\`)` if `!response.ok`.
    - Returns `response.json() as Promise<T>`.
  - Method `get<T>(endpoint: string, params?: Record<string, string | number>)`: delegates to `request<T>` with method `"GET"`.
  - Method `post<T>(endpoint: string, body: unknown)`: delegates to `request<T>` with method `"POST"` and `body: JSON.stringify(body)`.
