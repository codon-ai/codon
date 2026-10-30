import Database from "better-sqlite3";
const db = new Database(":memory:");
db.exec("CREATE TABLE todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, completed INTEGER DEFAULT 0)");
const insertStmt = db.prepare("INSERT INTO todos (title) VALUES (?)");
const toggleStmt = db.prepare("UPDATE todos SET completed = 1 - completed WHERE id = ?");
const selectAllStmt = db.prepare("SELECT * FROM todos ORDER BY id ASC");
export function addTodo(title) {
  const res = insertStmt.run(title);
  return Number(res.lastInsertRowid);
}
export function toggleTodo(id) {
  const res = toggleStmt.run(id);
  return res.changes > 0;
}
export function getTodos() {
  return selectAllStmt.all();
}
addTodo("Buy groceries");
addTodo("Clean the kitchen");
toggleTodo(1);
console.log(getTodos());
