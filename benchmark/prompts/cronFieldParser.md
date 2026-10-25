# Cron Expression Field Parser
Create a 5-part cron expression field expander in a single file.

Requirements:
- Export interface `ParsedCron { minutes: number[]; hours: number[]; daysOfMonth: number[]; months: number[]; daysOfWeek: number[]; }`.
- Export function `parseCron(expr: string): ParsedCron`.
- Splits expression by whitespace into 5 fields: minute (0-59), hour (0-23), dayOfMonth (1-31), month (1-12), dayOfWeek (0-6). Throws `new Error("Invalid cron expression")` if not 5 parts.
- Helper function `expandField(field: string, min: number, max: number): number[]` parses: `*` (all values min to max), ranges `a-b`, steps `*/step` or `range/step`, and comma-separated lists `a,b,c`. Sorts ascending without duplicates.
- Returns `{ minutes, hours, daysOfMonth, months, daysOfWeek }`.
