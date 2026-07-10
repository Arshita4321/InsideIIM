import { motion } from "framer-motion";
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
    <motion.div
      style={{
        marginTop: 32,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "28px",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Agent is researching…
      </motion.div>
      {STEPS.map((step, i) => (
        <motion.div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 0",
            borderBottom: i < STEPS.length - 1 ? "1px solid var(--border)" : "none",
            opacity: i <= active ? 1 : 0.3,
            transition: "opacity 0.4s",
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: i <= active ? 1 : 0.3, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <motion.span
            style={{ fontSize: 18 }}
            animate={i === active ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: i === active ? Infinity : 0 }}
          >
            {step.icon}
          </motion.span>
          <span
            style={{
              fontSize: 14,
              color: i === active ? "var(--text)" : "var(--muted)",
              fontWeight: i === active ? 500 : 400,
            }}
          >
            {step.text}
          </span>
          {i < active && (
            <motion.span
              style={{ marginLeft: "auto", color: "var(--invest)", fontSize: 13 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              ✓
            </motion.span>
          )}
          {i === active && (
            <motion.span
              style={{ marginLeft: "auto" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  background: "var(--accent)",
                  borderRadius: "50%",
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            </motion.span>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
