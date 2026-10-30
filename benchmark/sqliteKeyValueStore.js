import Database from "better-sqlite3";
export class SqliteKVStore {
  constructor(dbPath = ":memory:") {
    this.db = new Database(dbPath);
    this.db.exec("CREATE TABLE IF NOT EXISTS kv_store (key TEXT PRIMARY KEY, value TEXT)");
    this.getStmt = this.db.prepare("SELECT value FROM kv_store WHERE key = ?");
    this.setStmt = this.db.prepare("INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)");
    this.delStmt = this.db.prepare("DELETE FROM kv_store WHERE key = ?");
    this.clearStmt = this.db.prepare("DELETE FROM kv_store");
  }
  get(key) {
    const row = this.getStmt.get(key);
    return row ? row.value : null;
  }
  set(key, value) {
    this.setStmt.run(key, value);
  }
  delete(key) {
    const res = this.delStmt.run(key);
    return res.changes > 0;
  }
  clear() {
    this.clearStmt.run();
  }
}
