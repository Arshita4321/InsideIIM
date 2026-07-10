import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "/api";

const EXAMPLES = [
  { c1: "Zepto", c2: "Swiggy" },
  { c1: "HDFC Bank", c2: "ICICI Bank" },
  { c1: "Reliance Industries", c2: "Tata Consultancy Services" },
  { c1: "Infosys", c2: "Wipro" },
];

export default function Compare() {
  const navigate = useNavigate();
  const [company1, setCompany1] = useState("");
  const [company2, setCompany2] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  async function handleCompare() {
    if (!company1.trim() || !company2.trim()) return;
    setLoading(true);
    setResults(null);
    setError("");
    try {
      const { data } = await axios.post(`${API}/compare`, {
        company1: company1.trim(),
        company2: company2.trim(),
      });
      setResults(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Something went wrong. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleExample(c1, c2) {
    setCompany1(c1);
    setCompany2(c2);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <motion.header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>📊</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", color: "var(--text)" }}>
              AI <span style={{ color: "var(--accent)" }}>Investment</span> Agent
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              Company Comparison
            </div>
          </div>
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            onClick={() => navigate("/research")}
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
            whileHover={{ borderColor: "var(--accent)", color: "var(--text)" }}
          >
            Single Research
          </motion.button>
          <motion.button
            onClick={() => navigate("/")}
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
            whileHover={{ borderColor: "var(--accent)", color: "var(--text)" }}
          >
            ← Home
          </motion.button>
        </div>
      </motion.header>

      <main style={{ padding: "40px 28px", maxWidth: 1400, margin: "0 auto" }}>
        {/* Hero */}
        <motion.div
          style={{ textAlign: "center", marginBottom: 48 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #e2e8f0 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 10,
            }}
          >
            Compare two companies side by side.
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Get detailed investment analysis for both companies with direct comparison.
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 28,
            marginBottom: 32,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "end" }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                Company 1
              </label>
              <input
                value={company1}
                onChange={(e) => setCompany1(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                placeholder="e.g. Zepto"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--text)",
                  fontSize: 15,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <motion.div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--accent)",
                padding: "0 8px",
              }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              VS
            </motion.div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
                Company 2
              </label>
              <input
                value={company2}
                onChange={(e) => setCompany2(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                placeholder="e.g. Swiggy"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 18px",
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  color: "var(--text)",
                  fontSize: 15,
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 12, alignItems: "center" }}>
            <motion.button
              onClick={handleCompare}
              disabled={loading || !company1.trim() || !company2.trim()}
              style={{
                padding: "14px 32px",
                background: loading || !company1.trim() || !company2.trim() ? "var(--accent-dim)" : "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: loading || !company1.trim() || !company2.trim() ? "not-allowed" : "pointer",
                fontFamily: "Inter, sans-serif",
              }}
              whileHover={!loading && company1.trim() && company2.trim() ? { scale: 1.05 } : {}}
              whileTap={!loading && company1.trim() && company2.trim() ? { scale: 0.95 } : {}}
            >
              {loading ? "Comparing…" : "Compare Companies →"}
            </motion.button>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", paddingTop: 2 }}>Try:</span>
              {EXAMPLES.map((ex, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleExample(ex.c1, ex.c2)}
                  disabled={loading}
                  style={{
                    padding: "4px 12px",
                    background: "var(--surface2)",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    color: "var(--muted)",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                  whileHover={{ borderColor: "var(--accent)", color: "var(--text)" }}
                >
                  {ex.c1} vs {ex.c2}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              style={{
                padding: "14px 18px",
                background: "var(--pass-dim)",
                border: "1px solid var(--pass)",
                borderRadius: 10,
                color: "#fca5a5",
                fontSize: 14,
                marginBottom: 24,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <motion.div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 28,
              textAlign: "center",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              style={{ fontSize: 48, marginBottom: 16 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              🔄
            </motion.div>
            <div style={{ fontSize: 16, color: "var(--text)", marginBottom: 8 }}>
              Researching both companies in parallel…
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              This may take 30-60 seconds
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Summary Banner */}
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: 28,
                  marginBottom: 24,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
                  Comparison completed in {results.duration}s
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                      {results.company1.company}
                    </div>
                    <VerdictBadge verdict={results.company1.verdict} />
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>VS</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                      {results.company2.company}
                    </div>
                    <VerdictBadge verdict={results.company2.verdict} />
                  </div>
                </div>
              </div>

              {/* Side by Side Comparison */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <CompareCard data={results.company1} label="Company 1" />
                <CompareCard data={results.company2} label="Company 2" />
              </div>

              {/* Detailed Comparison Tables */}
              <div style={{ marginTop: 24 }}>
                <ComparisonTable results={results} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function VerdictBadge({ verdict }) {
  if (!verdict) return null;
  const isInvest = verdict.verdict === "INVEST";
  const color = isInvest ? "var(--invest)" : "var(--pass)";
  const bgColor = isInvest ? "var(--invest-dim)" : "var(--pass-dim)";

  return (
    <motion.div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        background: bgColor,
        border: `1px solid ${color}`,
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        color,
      }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {isInvest ? "✅" : "❌"} {verdict.verdict}
      {typeof verdict.confidence === "number" && (
        <span style={{ fontSize: 11, opacity: 0.8 }}>({verdict.confidence}%)</span>
      )}
    </motion.div>
  );
}

function CompareCard({ data, label }) {
  const v = data.verdict;
  if (!v) return null;

  return (
    <motion.div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: 24,
      }}
      initial={{ opacity: 0, x: label === "Company 1" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginBottom: 12 }}>
        {label}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>{data.company}</h3>

      {v.summary && (
        <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, marginBottom: 20 }}>
          {v.summary}
        </p>
      )}

      {v.financials && Object.keys(v.financials).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginBottom: 10 }}>
            Financials
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {Object.entries(v.financials).map(([key, val]) => (
              <div
                key={key}
                style={{
                  padding: "10px 12px",
                  background: "var(--surface2)",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              >
                <div style={{ color: "var(--muted)", textTransform: "capitalize", marginBottom: 2 }}>
                  {key}
                </div>
                <div style={{ fontWeight: 500 }}>{val || "N/A"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {v.strengths && v.strengths.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
            Strengths
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {v.strengths.map((s, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  background: "var(--invest-dim)",
                  border: "1px solid var(--invest)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#6ee7b7",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {v.risks && v.risks.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
            Risks
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {v.risks.map((r, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  background: "var(--pass-dim)",
                  border: "1px solid var(--pass)",
                  borderRadius: 6,
                  fontSize: 12,
                  color: "#fca5a5",
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ComparisonTable({ results }) {
  const v1 = results.company1.verdict;
  const v2 = results.company2.verdict;

  const rows = [
    { label: "Verdict", v1: v1?.verdict, v2: v2?.verdict },
    { label: "Confidence", v1: `${v1?.confidence || 0}%`, v2: `${v2?.confidence || 0}%` },
    { label: "Revenue", v1: v1?.financials?.revenue, v2: v2?.financials?.revenue },
    { label: "Funding", v1: v1?.financials?.funding, v2: v2?.financials?.funding },
    { label: "Valuation", v1: v1?.financials?.valuation, v2: v2?.financials?.valuation },
    { label: "Profitability", v1: v1?.financials?.profitability, v2: v2?.financials?.profitability },
    { label: "Market Position", v1: v1?.marketPosition, v2: v2?.marketPosition },
    { label: "Founder/Management", v1: v1?.founderBackground, v2: v2?.founderBackground },
    { label: "Recent News", v1: v1?.recentNews, v2: v2?.recentNews },
  ];

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
      transition={{ delay: 0.3 }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        Detailed Comparison
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr" }}>
        {/* Header */}
        <div style={{ padding: "12px 24px", background: "var(--surface2)", fontWeight: 600, fontSize: 13 }}>
          Metric
        </div>
        <div
          style={{
            padding: "12px 24px",
            background: "var(--surface2)",
            fontWeight: 600,
            fontSize: 13,
            borderLeft: "1px solid var(--border)",
          }}
        >
          {results.company1.company}
        </div>
        <div
          style={{
            padding: "12px 24px",
            background: "var(--surface2)",
            fontWeight: 600,
            fontSize: 13,
            borderLeft: "1px solid var(--border)",
          }}
        >
          {results.company2.company}
        </div>

        {/* Rows */}
        {rows.map((row, i) => (
          <div key={row.label} style={{ display: "contents" }}>
            <div
              style={{
                padding: "12px 24px",
                fontSize: 13,
                color: "var(--muted)",
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              {row.label}
            </div>
            <div
              style={{
                padding: "12px 24px",
                fontSize: 13,
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
                borderLeft: "1px solid var(--border)",
              }}
            >
              {row.v1 || "N/A"}
            </div>
            <div
              style={{
                padding: "12px 24px",
                fontSize: 13,
                borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
                borderLeft: "1px solid var(--border)",
              }}
            >
              {row.v2 || "N/A"}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
