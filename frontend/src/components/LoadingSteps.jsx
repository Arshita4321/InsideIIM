//src/components/LoadingSteps.jsx
import { useEffect, useState } from "react";

const STEPS = [
  { icon: "🔍", text: "Searching for company overview…" },
  { icon: "💰", text: "Looking up funding & financials…" },
  { icon: "👤", text: "Researching founder background…" },
  { icon: "📈", text: "Checking market position & competitors…" },
  { icon: "📰", text: "Scanning recent news…" },
  { icon: "🧠", text: "Synthesising investment verdict…" },
];

export default function LoadingSteps() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      marginTop: 32,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "28px"
    }}>
      <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}>
        Agent is researching…
      </div>
      {STEPS.map((step, i) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 0",
          borderBottom: i < STEPS.length - 1 ? "1px solid var(--border)" : "none",
          opacity: i <= active ? 1 : 0.3,
          transition: "opacity 0.4s",
        }}>
          <span style={{ fontSize: 18 }}>{step.icon}</span>
          <span style={{
            fontSize: 14,
            color: i === active ? "var(--text)" : "var(--muted)",
            fontWeight: i === active ? 500 : 400
          }}>
            {step.text}
          </span>
          {i < active && (
            <span style={{ marginLeft: "auto", color: "var(--invest)", fontSize: 13 }}>✓</span>
          )}
          {i === active && (
            <span style={{ marginLeft: "auto" }}>
              <span style={{
                display: "inline-block",
                width: 8, height: 8,
                background: "var(--accent)",
                borderRadius: "50%",
                animation: "pulse 1s infinite"
              }} />
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}