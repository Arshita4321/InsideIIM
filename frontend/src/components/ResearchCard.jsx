// src/components/ResearchCard.jsx

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
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
    </div>
  );
}

function Tag({ text, color }) {
  // FIX: Guard against empty/null tags
  if (!text) return null;
  return (
    <span
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
    >
      {text}
    </span>
  );
}

export default function ResearchCard({ verdict }) {
  // FIX: Full guard on verdict object
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
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "28px",
      }}
    >
      <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>
        Research Findings
      </h2>

      {/* Financials */}
      {/* FIX: Guard financials object before calling Object.entries */}
      {financials && Object.keys(financials).length > 0 && (
        <Section title="Financials">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {Object.entries(financials).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: "12px 16px",
                  background: "var(--surface2)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
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
                {/* FIX: Guard val */}
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {val || "N/A"}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths & Risks */}
      {/* FIX: Only render grid if at least one has items */}
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
              {/* FIX: Use (strengths || []) defensively */}
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

      {/* Text fields */}
      {[
        { label: "Market Position", value: marketPosition },
        { label: "Founder / Management", value: founderBackground },
        { label: "Recent News", value: recentNews },
        { label: "Recommendation", value: recommendation },
      ].map(
        ({ label, value }) =>
          // FIX: Only render if value exists and is non-empty
          value && value !== "Unknown" && (
            <Section key={label} title={label}>
              <p
                style={{
                  color: "var(--text)",
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                {value}
              </p>
            </Section>
          )
      )}
    </div>
  );
}