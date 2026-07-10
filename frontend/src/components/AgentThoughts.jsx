import { AnimatePresence, motion } from "framer-motion";
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
    <motion.div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <motion.button
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
        whileHover={{ backgroundColor: "var(--surface2)" }}
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
        <motion.span
          style={{
            color: "var(--muted)",
            display: "inline-block",
          }}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            style={{ padding: "0 24px 24px", borderTop: "1px solid var(--border)" }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
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
                const stepType = safeString(step.type) || "thinking";
                const stepContent = safeString(step.content);
                const stepTool = step.tool ? safeString(step.tool) : null;
                const toolCalls = Array.isArray(step.toolCalls)
                  ? step.toolCalls
                  : [];

                return (
                  <motion.div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      paddingLeft: 12,
                      borderLeft: `2px solid ${
                        TYPE_COLOR[stepType] || "var(--border)"
                      }`,
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    whileHover={{ x: 4 }}
                  >
                    <div style={{ flex: 1 }}>
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
                              <motion.span
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
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: j * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                {toolName}({inputStr}…)
                              </motion.span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
