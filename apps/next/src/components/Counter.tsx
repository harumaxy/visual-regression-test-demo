"use client";

import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: 24, backgroundColor: "#1a1a2e", borderRadius: 12, color: "#e0e0e0" }}>
      <p data-testid="count" style={{ fontSize: 24, fontWeight: "bold" }}>Count: {count}</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ padding: "8px 16px", backgroundColor: "#e94560", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => setCount((c) => c + 1)}>Increment</button>
        <button style={{ padding: "8px 16px", backgroundColor: "#0f3460", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }} onClick={() => setCount((c) => c - 1)}>Decrement</button>
      </div>
    </div>
  );
}
