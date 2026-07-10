import axios from "axios";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgentThoughts from "../components/AgentThoughts";
import HistorySidebar from "../components/HistorySidebar";
import LoadingSteps from "../components/LoadingSteps";
import ResearchCard from "../components/ResearchCard";
import SearchBar from "../components/SearchBar";
import VerdictBanner from "../components/VerdictBanner";

const API = "/api";

export default function Research() {
  const navigate = useNavigate();
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
      setError(
        err.response?.data?.error ||
        err.message ||
        "Something went wrong. Make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleHistorySelect(historyEntry) {
    setResult({
      company: historyEntry.company,
      verdict: historyEntry.full_data,
      thoughtSteps: [],
      duration: historyEntry.duration,
      fromHistory: true,
    });
    setCompany(historyEntry.company);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding: "16px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        {/* Logo — click to go back to landing */}
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
              Powered by Groq + LangGraph
            </div>
          </div>
        </button>

        {/* Back to home link */}
        <div style={{ display: "flex", gap: 10 }}>
          <motion.button
            onClick={() => navigate("/compare")}
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
            Compare Companies
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
      </header>

      {/* ── Body: Sidebar + Main ── */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>

        <HistorySidebar
          onSelect={handleHistorySelect}
          currentCompany={result?.company}
        />

        <main style={{ flex: 1, padding: "40px 28px", minWidth: 0 }}>

          {/* Hero — only before first search */}
          {!result && !loading && (
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h1 style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: "-1px",
                background: "linear-gradient(135deg, #e2e8f0 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 10,
              }}>
                Research any company.<br />Get an invest or pass verdict.
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 15 }}>
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