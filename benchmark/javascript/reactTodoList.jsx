import React, { useState, useRef } from "react";

export function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Buy milk", completed: false },
  ]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");
  const nextId = useRef(2);

  const addTodo = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos([
      ...todos,
      { id: nextId.current++, text: text.trim(), completed: false },
    ]);
    setText("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div>
      <h2>Todo List</h2>
      <form onSubmit={addTodo}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="New todo..."
        />
        <button type="submit">Add</button>
      </form>
      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
