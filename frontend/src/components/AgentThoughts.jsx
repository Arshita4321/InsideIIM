// src/components/AgentThoughts.jsx
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

// Safety helper: convert anything to a renderable string.
// This is the second line of defence — the backend now always sends strings,
// but this guard means the component can never crash even if a non-string slips through.
function safeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === "object"
          ? item.text || item.content || JSON.stringify(item)
          : String(item)
      )
      .join(" ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export default function AgentThoughts({ steps }) {
  const [open, setOpen] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
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
          <span
            style={{
              padding: "2px 10px",
              background: "var(--accent-dim)",
              color: "var(--accent)",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {steps.length} steps
          </span>
        </span>
        <span
          style={{
            color: "var(--muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </button>

      {/* Steps Timeline */}
      {open && (
        <div
          style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}
        >
          <div
            style={{
              paddingTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {steps.map((step, i) => {
              // Safely extract all fields — never trust raw data to be a string
              const stepType = safeString(step.type) || "thinking";
              const stepContent = safeString(step.content);
              const stepTool = step.tool ? safeString(step.tool) : null;
              const toolCalls = Array.isArray(step.toolCalls)
                ? step.toolCalls
                : [];

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 14,
                    paddingLeft: 12,
                    borderLeft: `2px solid ${
                      TYPE_COLOR[stepType] || "var(--border)"
                    }`,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {/* Step label */}
                    <div
                      style={{
                        fontSize: 12,
                        color: TYPE_COLOR[stepType] || "var(--muted)",
                        fontWeight: 600,
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {TYPE_ICON[stepType] || "•"}{" "}
                      {stepType.replace("_", " ")}
                      {stepTool && ` — ${stepTool}`}
                    </div>

                    {/* Step content — always a plain string now */}
                    {stepContent && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--text)",
                          lineHeight: 1.6,
                          marginBottom: toolCalls.length > 0 ? 8 : 0,
                          wordBreak: "break-word",
                        }}
                      >
                        {stepContent}
                      </p>
                    )}

                    {/* Tool call badges */}
                    {toolCalls.length > 0 && (
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                      >
                        {toolCalls.map((tc, j) => {
                          const toolName = safeString(tc.tool);
                          let inputStr = "";
                          try {
                            inputStr = JSON.stringify(tc.input || {}).slice(0, 60);
                          } catch {
                            inputStr = "…";
                          }
                          return (
                            <span
                              key={j}
                              style={{
                                padding: "3px 10px",
                                background: "var(--surface2)",
                                border: "1px solid var(--border)",
                                borderRadius: 6,
                                fontSize: 12,
                                fontFamily: "JetBrains Mono, monospace",
                                color: "var(--yellow)",
                              }}
                            >
                              {toolName}({inputStr}…)
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}