export class JsonLogger {
  constructor(serviceName, minLevel = "INFO") {
    this.serviceName = serviceName;
    this.minLevel = minLevel;
    this.levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  }
  log(level, message, context) {
    if (this.levels[level] < this.levels[this.minLevel]) return;
    const entry = {
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {})
    };
    const str = JSON.stringify(entry) + "\n";
    if (level === "ERROR") process.stderr.write(str);
    else process.stdout.write(str);
  }
  debug(msg, ctx) { this.log("DEBUG", msg, ctx); }
  info(msg, ctx) { this.log("INFO", msg, ctx); }
  warn(msg, ctx) { this.log("WARN", msg, ctx); }
  error(msg, ctx) { this.log("ERROR", msg, ctx); }
}
