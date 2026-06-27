// src/components/HistorySidebar.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API = "/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function HistorySidebar({ onSelect, currentCompany }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(true);

  // Fetch full history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const { data } = await axios.get(`${API}/history`);
      setHistory(data);
    } catch (err) {
      console.warn("Could not load history:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // Re-fetch whenever a new research completes (currentCompany changes)
  useEffect(() => {
    if (currentCompany) {
      // Small delay so DB write finishes first
      setTimeout(fetchHistory, 800);
    }
  }, [currentCompany]);

  async function handleDelete(e, id) {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/history/${id}`);
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.warn("Delete failed:", err.message);
    }
  }

  async function handleSelect(id) {
    try {
      const { data } = await axios.get(`${API}/history/${id}`);
      onSelect(data);
    } catch (err) {
      console.warn("Could not load entry:", err.message);
    }
  }

  const filtered = search.trim()
    ? history.filter((h) =>
        h.company.toLowerCase().includes(search.trim().toLowerCase())
      )
    : history;

  return (
    <aside style={{
      width: open ? 280 : 44,
      minHeight: "calc(100vh - 61px)",
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      transition: "width 0.25s ease",
      overflow: "hidden",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title={open ? "Collapse history" : "Show history"}
        style={{
          padding: "14px",
          background: "transparent",
          border: "none",
          borderBottom: "1px solid var(--border)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--text)",
          whiteSpace: "nowrap",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        <span style={{ fontSize: 16 }}>🕒</span>
        {open && <span>Research History</span>}
        {open && (
          <span style={{
            marginLeft: "auto",
            color: "var(--muted)",
            fontSize: 12,
            fontWeight: 400,
          }}>
            ◀
          </span>
        )}
      </button>

      {/* Sidebar content — only visible when open */}
      {open && (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
          {/* Search */}
          <div style={{ padding: "12px 12px 8px" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter companies…"
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
                fontFamily: "Inter, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Count */}
          <div style={{ padding: "0 14px 8px", fontSize: 11, color: "var(--muted)" }}>
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading && (
              <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>
                Loading…
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {search ? "No matches found" : "No research yet"}
                </div>
              </div>
            )}

            {filtered.map((item) => {
              const isInvest = item.verdict === "INVEST";
              const isActive = currentCompany?.toLowerCase() === item.company.toLowerCase();

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--border)",
                    cursor: "pointer",
                    background: isActive ? "var(--accent-dim)" : "transparent",
                    transition: "background 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--surface2)";
                    e.currentTarget.querySelector(".del-btn").style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                    e.currentTarget.querySelector(".del-btn").style.opacity = "0";
                  }}
                >
                  {/* Company name + verdict badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {item.company}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: 10,
                      background: isInvest ? "var(--invest-dim)" : "var(--pass-dim)",
                      color: isInvest ? "var(--invest)" : "var(--pass)",
                      border: `1px solid ${isInvest ? "var(--invest)" : "var(--pass)"}`,
                      whiteSpace: "nowrap",
                    }}>
                      {isInvest ? "✅ INVEST" : "❌ PASS"}
                    </span>
                  </div>

                  {/* Summary snippet */}
                  {item.summary && (
                    <div style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.5,
                    }}>
                      {item.summary}
                    </div>
                  )}

                  {/* Meta row */}
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: "var(--muted)" }}>
                    <span>{item.confidence}% confidence</span>
                    <span>·</span>
                    <span>{item.duration}s</span>
                    <span>·</span>
                    <span>{timeAgo(item.created_at)}</span>
                  </div>

                  {/* Delete button */}
                  <button
                    className="del-btn"
                    onClick={(e) => handleDelete(e, item.id)}
                    title="Delete"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: "var(--pass-dim)",
                      border: "1px solid var(--pass)",
                      borderRadius: 4,
                      color: "var(--pass)",
                      fontSize: 10,
                      padding: "2px 5px",
                      cursor: "pointer",
                      opacity: 0,
                      transition: "opacity 0.15s",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <div style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--muted)",
              textAlign: "center",
            }}>
              Click any entry to reload it
            </div>
          )}
        </div>
      )}
    </aside>
  );
}