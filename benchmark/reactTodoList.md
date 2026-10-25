# React Todo List
Create a barebones React Todo List component in a single file using React hooks. Do not include any CSS, classes, inline styles, or backend connections.

Requirements:
- Export a functional component named `TodoList`.
- Maintain state `todos` of type `Array<{ id: number, text: string, completed: boolean }>` initialized to `[{ id: 1, text: "Buy milk", completed: false }]`.
- Maintain state `text: string` initialized to `""`.
- Maintain state `filter: "all" | "active" | "completed"` initialized to `"all"`.
- Maintain ref `nextId: number` initialized to `2`.
- Form submission `addTodo(e: React.FormEvent)`: prevents default, returns early if `text.trim()` is empty, appends new todo `{ id: nextId.current++, text: text.trim(), completed: false }`, and resets `text` to `""`.
- Toggle function `toggleTodo(id: number)`: inverts `completed` for matching todo.
- Delete function `deleteTodo(id: number)`: removes todo by id.
- Component returns an outer `<div>` containing: `<h2>Todo List</h2>`, a `<form onSubmit={addTodo}>` with `<input value={text} onChange={(e) => setText(e.target.value)} placeholder="New todo..." />` and `<button type="submit">Add</button>`, a `<div>` containing 3 filter buttons for `"all"`, `"active"`, and `"completed"` setting `filter`, and a `<ul>` mapping filtered todos into `<li>` elements each containing `<input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />`, `<span>{todo.text}</span>`, and `<button onClick={() => deleteTodo(todo.id)}>Delete</button>`.
