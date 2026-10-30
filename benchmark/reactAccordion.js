import React, { useState } from "react";
export function Accordion({ items }) {
  const [openId, setOpenId] = useState(null);
  const toggleItem = id => setOpenId(openId === id ? null : id);
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <button onClick={() => toggleItem(item.id)}>{item.title}</button>
          {openId === item.id && <div>{item.content}</div>}
        </div>
      ))}
    </div>
  );
}
