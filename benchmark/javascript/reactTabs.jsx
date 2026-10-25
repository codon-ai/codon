import React, { useState } from "react";

export function Tabs({ tabs }) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || "");
  const currentTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div>
      <nav>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTabId(tab.id)}>
            {tab.label}
          </button>
        ))}
      </nav>
      <div role="tabpanel">{currentTab?.content}</div>
    </div>
  );
}
