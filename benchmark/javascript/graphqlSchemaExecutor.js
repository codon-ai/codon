export class MiniGraphQL {
  constructor() {
    this.resolvers = new Map();
  }

  register(field, resolver) {
    this.resolvers.set(field, resolver);
  }

  async execute(query) {
    const trimmed = query.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
      return { data: {}, errors: ["Invalid GraphQL query format"] };
    }
    const inner = trimmed.slice(1, -1).trim();
    const parenIdx = inner.indexOf("(");
    let fieldName = "";
    let argsStr = "";

    if (parenIdx !== -1) {
      if (!inner.endsWith(")")) {
        return { data: {}, errors: ["Invalid GraphQL query format"] };
      }
      fieldName = inner.slice(0, parenIdx).trim();
      argsStr = inner.slice(parenIdx + 1, -1).trim();
    } else {
      fieldName = inner.trim();
    }

    const args = {};
    if (argsStr) {
      const pairs = argsStr.split(",");
      for (const pair of pairs) {
        const [k, v] = pair.split(":").map((s) => s.trim());
        if (k && v !== undefined) {
          if (v.startsWith('"') && v.endsWith('"')) {
            args[k] = v.slice(1, -1);
          } else {
            args[k] = Number(v);
          }
        }
      }
    }

    if (!this.resolvers.has(fieldName)) {
      return { data: {}, errors: [`Field "${fieldName}" not found`] };
    }

    const resolver = this.resolvers.get(fieldName);
    const result = await resolver(args);
    return { data: { [fieldName]: result } };
  }
}
