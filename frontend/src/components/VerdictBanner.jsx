import { motion } from "framer-motion";

export default function VerdictBanner({ verdict, company, duration }) {
  if (!verdict) return null;

  const isInvest = verdict.verdict === "INVEST";
  const color = isInvest ? "var(--invest)" : "var(--pass)";
  const dimColor = isInvest ? "var(--invest-dim)" : "var(--pass-dim)";

  return (
    <motion.div
      style={{
        padding: "24px 28px",
        background: dimColor,
        border: `1px solid ${color}`,
        borderRadius: 14,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 20,
      }}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
    >
      <div style={{ flex: 1 }}>
        <motion.div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 10,
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color,
              letterSpacing: "-0.5px",
              fontFamily: "JetBrains Mono, monospace",
            }}
            animate={isInvest ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.6, repeat: isInvest ? 2 : 0 }}
          >
            {isInvest ? "✅ INVEST" : "❌ PASS"}
          </motion.span>
          {typeof verdict.confidence === "number" && (
            <motion.span
              style={{
                padding: "3px 12px",
                background: color,
                color: "#000",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
            >
              {verdict.confidence}% confidence
            </motion.span>
          )}
        </motion.div>
        {verdict.summary && (
          <motion.p
            style={{ color: "var(--text)", fontSize: 15, lineHeight: 1.7 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {verdict.summary}
          </motion.p>
        )}
      </div>

      <motion.div
        style={{ textAlign: "right", minWidth: 120 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{company}</div>
        {duration && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            ⏱ {duration}s
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
