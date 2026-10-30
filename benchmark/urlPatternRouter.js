export class UrlRouter {
  constructor() {
    this.routes = [];
  }
  add(pattern, handler) {
    const paramNames = [];
    const regexStr = pattern.replace(/:([a-zA-Z0-9_]+)/g, (_, name) => {
      paramNames.push(name);
      return "([^/]+)";
    });
    this.routes.push({ regex: new RegExp(`^${regexStr}$`), paramNames, handler });
  }
  match(pathname) {
    for (const route of this.routes) {
      const match = pathname.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1];
        });
        return { handler: route.handler, params };
      }
    }
    return null;
  }
}
