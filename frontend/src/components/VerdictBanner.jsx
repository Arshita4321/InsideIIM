// src/components/VerdictBanner.jsx

export default function VerdictBanner({ verdict, company, duration }) {
  // FIX: Guard against null verdict object
  if (!verdict) return null;

  const isInvest = verdict.verdict === "INVEST";
  const color = isInvest ? "var(--invest)" : "var(--pass)";
  const dimColor = isInvest ? "var(--invest-dim)" : "var(--pass-dim)";

  return (
    <div
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
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 800,
              color,
              letterSpacing: "-0.5px",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {isInvest ? "✅ INVEST" : "❌ PASS"}
          </span>
          {/* FIX: Guard confidence value */}
          {typeof verdict.confidence === "number" && (
            <span
              style={{
                padding: "3px 12px",
                background: color,
                color: "#000",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {verdict.confidence}% confidence
            </span>
          )}
        </div>
        {/* FIX: Guard summary */}
        {verdict.summary && (
          <p style={{ color: "var(--text)", fontSize: 15, lineHeight: 1.7 }}>
            {verdict.summary}
          </p>
        )}
      </div>

      <div style={{ textAlign: "right", minWidth: 120 }}>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{company}</div>
        {duration && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            ⏱ {duration}s
          </div>
        )}
      </div>
    </div>
  );
}