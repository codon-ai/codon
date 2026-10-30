export class MiniGraphQL {
  constructor() {
    this.resolvers = new Map();
  }
  register(field, resolver) {
    this.resolvers.set(field, resolver);
  }
  async execute(query) {
    const trimmed = query.trim().replace(/^\{\s*|\s*\}$/g, "");
    const match = trimmed.match(/^([a-zA-Z0-9_]+)(?:\((.*)\))?$/);
    if (!match) return { data: {}, errors: ["Invalid query"] };
    const fieldName = match[1];
    const argsStr = match[2];
    const args = {};
    if (argsStr) {
      const regex = /([a-zA-Z0-9_]+)\s*:\s*("(?:[^"\\]|\\.)*"|\d+(?:\.\d+)?)/g;
      let m;
      while ((m = regex.exec(argsStr)) !== null) {
        const k = m[1], v = m[2];
        args[k] = v.startsWith('"') ? JSON.parse(v) : Number(v);
      }
    }
    const resolver = this.resolvers.get(fieldName);
    if (!resolver) return { data: {}, errors: [`Field "${fieldName}" not found`] };
    const result = await resolver(args);
    return { data: { [fieldName]: result } };
  }
}
