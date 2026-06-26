//src/components/SearchBar.jsx
const EXAMPLES = ["Zepto", "Reliance Industries", "Swiggy", "Stripe", "HDFC Bank"];

export default function SearchBar({ value, onChange, onSearch, loading }) {
  function handleKey(e) {
    if (e.key === "Enter" && value.trim()) onSearch(value.trim());
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Enter company name (e.g. Zepto, Stripe, HDFC Bank)..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "14px 18px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--text)",
            fontSize: 15,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        <button
          onClick={() => value.trim() && onSearch(value.trim())}
          disabled={loading || !value.trim()}
          style={{
            padding: "14px 24px",
            background: loading ? "var(--accent-dim)" : "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "Researching…" : "Research →"}
        </button>
      </div>

      {/* Quick examples */}
      <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--muted)", paddingTop: 2 }}>Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => { onChange(ex); onSearch(ex); }}
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
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}