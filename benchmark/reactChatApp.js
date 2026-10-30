import React, { useState, useRef } from "react";
export function ChatApp() {
  const [messages, setMessages] = useState([{ id: 1, user: "Alice", text: "Hello world!" }]);
  const [input, setInput] = useState("");
  const nextId = useRef(2);
  const sendMessage = e => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: nextId.current++, user: "Me", text: input.trim() }]);
    setInput("");
  };
  return (
    <div>
      <h2>Chat Room</h2>
      <ul>
        {messages.map(m => (
          <li key={m.id}>
            <strong>{m.user}:</strong> {m.text}
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
