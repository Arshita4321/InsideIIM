import { useState } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import LoadingSteps from "./components/LoadingSteps";
import VerdictBanner from "./components/VerdictBanner";
import ResearchCard from "./components/ResearchCard";
import AgentThoughts from "./components/AgentThoughts";
import HistorySidebar from "./components/HistorySidebar";
import "./index.css";

const API = "/api";

export default function App() {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleResearch(name) {
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const { data } = await axios.post(`${API}/research`, { company: name });
      setResult(data);
    } catch (err) {
      console.error("Research error:", err);
      setError(
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  // Called when user clicks a history entry — restore that result into the UI
  function handleHistorySelect(historyEntry) {
    setResult({
      company: historyEntry.company,
      verdict: historyEntry.full_data,
      thoughtSteps: [],           // thought steps aren't stored — just show verdict
      duration: historyEntry.duration,
      fromHistory: true,
    });
    setCompany(historyEntry.company);
    setError("");
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <span style={{ fontSize: 22 }}>📊</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: "-0.3px" }}>
            AI Investment Research Agent
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Powered by Gemini + LangGraph · Deep company analysis
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>

        {/* ── History Sidebar ── */}
        <HistorySidebar
          onSelect={handleHistorySelect}
          currentCompany={result?.company}
        />

        {/* ── Main Content ── */}
        <main style={{ flex: 1, padding: "40px 28px", minWidth: 0 }}>

          {/* Hero — only before first search */}
          {!result && !loading && (
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h1 style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-1px",
                background: "linear-gradient(135deg, #e2e8f0 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 12,
              }}>
                Research any company.<br />Get an invest or pass verdict.
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 16 }}>
                The agent searches the web, checks financials, and gives you structured analysis.
              </p>
            </div>
          )}

          <SearchBar
            value={company}
            onChange={setCompany}
            onSearch={handleResearch}
            loading={loading}
          />

          {/* "Loaded from history" notice */}
          {result?.fromHistory && (
            <div style={{
              marginTop: 16,
              padding: "10px 16px",
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--accent)",
            }}>
              📂 Loaded from history · Search again to refresh
            </div>
          )}

          {error && (
            <div style={{
              marginTop: 24,
              padding: "14px 18px",
              background: "var(--pass-dim)",
              border: "1px solid var(--pass)",
              borderRadius: 10,
              color: "#fca5a5",
              fontSize: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {loading && <LoadingSteps />}

          {result && (
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>
              <VerdictBanner
                verdict={result.verdict}
                company={result.company}
                duration={result.duration}
              />
              <ResearchCard verdict={result.verdict} />
              {!result.fromHistory && (
                <AgentThoughts steps={result.thoughtSteps || []} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}