NB. i|D:Database:better-sqlite3

db =: (new Database ':memory:')

(db.exec `
  CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`)

insertStmt =: (db.prepare 'INSERT INTO todos (title) VALUES (?)')

toggleStmt =: (db.prepare 'UPDATE todos SET completed = 1 - completed WHERE id = ?')

selectAllStmt =: (db.prepare 'SELECT * FROM todos ORDER BY id ASC')

NB. export
{{ NB. FD|addTodo|title
result =: (insertStmt.run title)
return. (Number result.lastInsertRowid)
}}

NB. export
{{ NB. FD|toggleTodo|id
result =: (toggleStmt.run id)
return. (result.changes > 0)
}}

NB. export
{{ NB. FD|getTodos|
return. selectAllStmt.all()
}}

(addTodo 'Buy groceries')

(addTodo 'Clean the kitchen')

(toggleTodo 1)

(console.log getTodos())