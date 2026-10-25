export class UrlRouter {
  constructor() {
    this.routes = [];
  }

  add(pattern, handler) {
    const parts = pattern.split("/").filter(Boolean);
    this.routes.push({ parts, handler });
  }

  match(pathname) {
    const pathParts = pathname.split("/").filter(Boolean);
    for (const route of this.routes) {
      if (route.parts.length !== pathParts.length) {
        continue;
      }
      const params = {};
      let matched = true;
      for (let i = 0; i < route.parts.length; i++) {
        const seg = route.parts[i];
        if (seg.startsWith(":")) {
          params[seg.slice(1)] = pathParts[i];
        } else if (seg !== pathParts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        return { handler: route.handler, params };
      }
    }
    return null;
  }
}
