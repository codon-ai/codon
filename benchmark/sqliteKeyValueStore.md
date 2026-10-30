# SQLite Key-Value Store
Create a persistent SQLite-backed Key-Value store class in a single file using better-sqlite3.

Requirements:
- Import `Database` from `"better-sqlite3"`.
- Export class `SqliteKVStore`: constructor accepts optional `dbPath: string = ":memory:"`.
- Creates table `CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)`.
- Prepares statements: `getStmt: SELECT value FROM kv_store WHERE key = ?`, `setStmt: INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)`, `delStmt: DELETE FROM kv_store WHERE key = ?`, `clearStmt: DELETE FROM kv_store`.
- Method `get(key: string): string | null`: returns value string or null.
- Method `set(key: string, value: string): void`: executes insert/replace.
- Method `delete(key: string): boolean`: executes delete, returns `changes > 0`.
- Method `clear(): void`: executes clear statement.
