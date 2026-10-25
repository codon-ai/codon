# SQLite Schema Migration Runner
Create a numbered schema migration runner in a single file using better-sqlite3.

Requirements:
- Import `Database` from `"better-sqlite3"`.
- Export interface `Migration { version: number; name: string; sql: string; }`.
- Export class `MigrationRunner`: constructor takes `db: Database.Database`.
- Creates tracking table `CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, name TEXT, applied_at TEXT)`.
- Method `getAppliedVersions(): number[]`: queries all applied versions sorted ascending.
- Method `apply(migrations: Migration[]): number[]`: sorts migrations by version. In a database transaction, checks each migration against applied versions. If not applied, executes `db.exec(migration.sql)`, inserts record into `migrations`, and collects version in applied list. Returns array of newly applied versions.
