//src/components/AgentThoughts.jsx
import { useState } from "react";

const TYPE_COLOR = {
  thinking: "var(--accent)",
  tool_result: "var(--yellow)",
  verdict: "var(--invest)",
};

const TYPE_ICON = {
  thinking: "🧠",
  tool_result: "🔧",
  verdict: "⚖️",
};

export default function AgentThoughts({ steps }) {
  const [open, setOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      overflow: "hidden"
    }}>
      {/* Toggle Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "18px 24px",
          background: "transparent",
          border: "none",
          color: "var(--text)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 15,
          fontWeight: 600,
          fontFamily: "Inter, sans-serif",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>🤖</span> Agent Thought Process
          <span style={{
            padding: "2px 10px",
            background: "var(--accent-dim)",
            color: "var(--accent)",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 500
          }}>
            {steps.length} steps
          </span>
        </span>
        <span style={{
          color: "var(--muted)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.25s"
        }}>
          ▼
        </span>
      </button>

      {/* Steps Timeline */}
      {open && (
        <div style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}>
          <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 14,
                paddingLeft: 12,
                borderLeft: `2px solid ${TYPE_COLOR[step.type] || "var(--border)"}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 12,
                    color: TYPE_COLOR[step.type],
                    fontWeight: 600,
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    {TYPE_ICON[step.type]} {step.type.replace("_", " ")}
                    {step.tool && ` — ${step.tool}`}
                  </div>

                  {step.content && (
                    <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, marginBottom: 6 }}>
                      {step.content}
                    </p>
                  )}

                  {/* Tool calls (what the agent planned to do) */}
                  {step.toolCalls?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {step.toolCalls.map((tc, j) => (
                        <span key={j} style={{
                          padding: "3px 10px",
                          background: "var(--surface2)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          fontSize: 12,
                          fontFamily: "JetBrains Mono, monospace",
                          color: "var(--yellow)"
                        }}>
                          {tc.tool}({JSON.stringify(tc.input).slice(0, 60)}…)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}