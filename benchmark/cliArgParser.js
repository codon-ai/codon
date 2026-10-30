export function parseArgs(argv) {
  const flags = {}, options = {}, positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const rest = arg.slice(2);
      const eq = rest.indexOf("=");
      if (eq !== -1) {
        options[rest.slice(0, eq)] = rest.slice(eq + 1);
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
        options[rest] = argv[++i];
      } else {
        flags[rest] = true;
      }
    } else if (arg.startsWith("-")) {
      flags[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }
  return { flags, options, positional };
}
