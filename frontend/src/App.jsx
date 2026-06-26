import { useState } from "react";
import axios from "axios";
import SearchBar from "./components/SearchBar";
import LoadingSteps from "./components/LoadingSteps";
import VerdictBanner from "./components/VerdictBanner";
import ResearchCard from "./components/ResearchCard";
import AgentThoughts from "./components/AgentThoughts";
import "./index.css";


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
    // ←←← THIS IS THE IMPORTANT LINE ←←←
    const { data } = await axios.post("/api/research", { company: name });
    
    setResult(data);
  } catch (err) {
    console.error("Research error:", err); // Helpful for debugging
    setError(
      err.response?.data?.error || 
      err.message || 
      "Something went wrong. Make sure backend is running."
    );
  } finally {
    setLoading(false);
  }
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
        background: "var(--surface)"
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

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Hero */}
        {!result && !loading && (
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h1 style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-1px",
              background: "linear-gradient(135deg, #e2e8f0 0%, #6366f1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: 12
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

        {error && (
          <div style={{
            marginTop: 24,
            padding: "14px 18px",
            background: "var(--pass-dim)",
            border: "1px solid var(--pass)",
            borderRadius: 10,
            color: "#fca5a5",
            fontSize: 14
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
            <AgentThoughts steps={result.thoughtSteps || []} />
          </div>
        )}
      </main>
    </div>
  );
}