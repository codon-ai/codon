export function parseArgs(argv) {
  const flags = {};
  const options = {};
  const positional = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      if (arg.includes("=")) {
        const eqIdx = arg.indexOf("=");
        const key = arg.slice(2, eqIdx);
        const value = arg.slice(eqIdx + 1);
        options[key] = value;
      } else {
        const key = arg.slice(2);
        if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
          options[key] = argv[++i];
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith("-")) {
      flags[arg.slice(1)] = true;
    } else {
      positional.push(arg);
    }
  }

  return { flags, options, positional };
}
