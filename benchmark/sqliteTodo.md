# SQLite Todo
Create an in-memory SQLite todo repository in a single file using the "better-sqlite3" library.

Requirements:
- Open an in-memory database with `new Database(":memory:")`.
- Execute DDL to create table `todos` with columns:
  - `id INTEGER PRIMARY KEY AUTOINCREMENT`
  - `title TEXT NOT NULL`
  - `completed INTEGER DEFAULT 0`
- Prepare statements:
  - `insertStmt`: `"INSERT INTO todos (title) VALUES (?)"`
  - `toggleStmt`: `"UPDATE todos SET completed = 1 - completed WHERE id = ?"`
  - `selectAllStmt`: `"SELECT * FROM todos ORDER BY id ASC"`
- Export three functions:
  1. `addTodo(title: string): number` — runs `insertStmt` with title, returns `Number(result.lastInsertRowid)`
  2. `toggleTodo(id: number): boolean` — runs `toggleStmt` with id, returns `result.changes > 0`
  3. `getTodos(): Todo[]` — returns all records from `selectAllStmt` with type `{ id: number, title: string, completed: number }`
- At the bottom, run sample calls: add "Buy groceries", add "Clean the kitchen", toggle ID 1, and `console.log(getTodos())`.
