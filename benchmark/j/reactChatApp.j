NB. i|D:React:react|N:useState:react|N:useRef:react

NB. export
{{ NB. FD|ChatApp|
[messages,setMessages] =: (useState (,O('id';1;'user';'Alice';'text';'Hello world!')))
[input,setInput] =: (useState '')
nextId =: (useRef 2)
sendMessage =: ({{ NB. pB|e
e.preventDefault()
if. (! input.trim()) do.
return.
end.
(setMessages ({{ NB. pE|prev
('...';prev;O('id';(nextId.current++);'user';'Me';'text';input.trim()))
}}))
(setInput '')
}})
return. (<div>
      <h2>Chat Room</h2>
      <ul>
        {messages.map(m => <li key={m.id}>
            <strong>{m.user}:</strong> {m.text}
          </li>)}
      </ul>
      <form onSubmit={sendMessage}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>)
}}