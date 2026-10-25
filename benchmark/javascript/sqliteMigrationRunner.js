import Database from "better-sqlite3";

export class MigrationRunner {
  constructor(db) {
    this.db = db;
    this.db.exec(
      "CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, name TEXT, applied_at TEXT)"
    );
  }

  getAppliedVersions() {
    const rows = this.db
      .prepare("SELECT version FROM migrations ORDER BY version ASC")
      .all();
    return rows.map((r) => r.version);
  }

  apply(migrations) {
    const sorted = [...migrations].sort((a, b) => a.version - b.version);
    const applied = new Set(this.getAppliedVersions());
    const newlyApplied = [];
    const insertStmt = this.db.prepare(
      "INSERT INTO migrations (version, name, applied_at) VALUES (?, ?, ?)"
    );

    const tx = this.db.transaction(() => {
      for (const m of sorted) {
        if (!applied.has(m.version)) {
          this.db.exec(m.sql);
          insertStmt.run(m.version, m.name, new Date().toISOString());
          newlyApplied.push(m.version);
        }
      }
    });

    tx();
    return newlyApplied;
  }
}
