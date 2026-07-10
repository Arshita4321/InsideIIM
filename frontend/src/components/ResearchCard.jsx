import { motion } from "framer-motion";

function Section({ title, children }) {
  return (
    <motion.div
      style={{ marginBottom: 20 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: 10,
        }}
      >
        {title}
      </div>
      {children}
    </motion.div>
  );
}

function Tag({ text, color }) {
  if (!text) return null;
  return (
    <motion.span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        background:
          color === "green"
            ? "var(--invest-dim)"
            : color === "red"
            ? "var(--pass-dim)"
            : "var(--surface2)",
        color:
          color === "green"
            ? "#6ee7b7"
            : color === "red"
            ? "#fca5a5"
            : "var(--text)",
        border: `1px solid ${
          color === "green"
            ? "var(--invest)"
            : color === "red"
            ? "var(--pass)"
            : "var(--border)"
        }`,
        borderRadius: 6,
        fontSize: 13,
        marginRight: 8,
        marginBottom: 8,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      {text}
    </motion.span>
  );
}

export default function ResearchCard({ verdict }) {
  if (!verdict) return null;

  const {
    strengths,
    risks,
    financials,
    marketPosition,
    founderBackground,
    recentNews,
    recommendation,
  } = verdict;

  return (
    <motion.div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "28px",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.h2
        style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Research Findings
      </motion.h2>

      {financials && Object.keys(financials).length > 0 && (
        <Section title="Financials">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {Object.entries(financials).map(([key, val], i) => (
              <motion.div
                key={key}
                style={{
                  padding: "12px 16px",
                  background: "var(--surface2)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ borderColor: "var(--accent)", y: -2 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    textTransform: "capitalize",
                    marginBottom: 4,
                  }}
                >
                  {key}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {val || "N/A"}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {((strengths && strengths.length > 0) || (risks && risks.length > 0)) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
            marginBottom: 20,
          }}
        >
          {strengths && strengths.length > 0 && (
            <Section title="Strengths">
              {(strengths || []).map((s, i) => (
                <Tag key={i} text={s} color="green" />
              ))}
            </Section>
          )}
          {risks && risks.length > 0 && (
            <Section title="Risks">
              {(risks || []).map((r, i) => (
                <Tag key={i} text={r} color="red" />
              ))}
            </Section>
          )}
        </div>
      )}

      {[
        { label: "Market Position", value: marketPosition },
        { label: "Founder / Management", value: founderBackground },
        { label: "Recent News", value: recentNews },
        { label: "Recommendation", value: recommendation },
      ].map(
        ({ label, value }, i) =>
          value && value !== "Unknown" && (
            <Section key={label} title={label}>
              <motion.p
                style={{
                  color: "var(--text)",
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
              >
                {value}
              </motion.p>
            </Section>
          )
      )}
    </motion.div>
  );
}
