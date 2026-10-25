# React Chat App
Create a barebones React chat component in a single file using React hooks. Do not include any CSS, classes, inline styles, or backend connections.

Requirements:
- Export a functional component named `ChatApp`.
- Maintain a `messages` state initialized with `[{ id: 1, user: "Alice", text: "Hello world!" }]`.
- Maintain an `input` text state initialized with `""`.
- Maintain a `nextId` ref initialized with `2`.
- Form submission function `sendMessage(e)`: prevents default event, returns early if `input.trim()` is empty, appends `{ id: nextId.current++, user: "Me", text: input.trim() }` to `messages`, and resets `input` to `""`.
- Component returns:
  - An outer `<div>` containing:
    - An `<h2>` with text "Chat Room"
    - A `<ul>` mapping messages into `<li>` with `key={m.id}` containing `<strong>{m.user}:</strong> {m.text}`
    - A `<form onSubmit={sendMessage}>` containing:
      - An `<input>` controlled by `input` with `placeholder="Type a message..."`
      - A `<button type="submit">` with text "Send"
