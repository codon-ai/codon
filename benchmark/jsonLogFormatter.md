# Structured JSON Log Formatter
Create a structured JSON logger emitting standardized log records in a single file.

Requirements:
- Type `LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR"`.
- Export interface `LogEntry { timestamp: string; level: LogLevel; message: string; context?: Record<string, any>; }`.
- Export class `JsonLogger`: constructor takes `serviceName: string` and optional `minLevel: LogLevel = "INFO"`.
- Internal level severity mapping: `DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3`.
- Methods `debug(msg: string, ctx?)`, `info(msg: string, ctx?)`, `warn(msg: string, ctx?)`, `error(msg: string, ctx?)`.
- If log level severity is >= `minLevel`, construct `LogEntry` with ISO timestamp (`new Date().toISOString()`), format as JSON line `JSON.stringify({ service: this.serviceName, ...entry })`, and write to `process.stdout` (or `process.stderr` for ERROR).
