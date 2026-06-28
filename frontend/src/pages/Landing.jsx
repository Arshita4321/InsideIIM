
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const TOOLS = [
  {
    icon: "🔍",
    name: "Web search",
    desc: "Queries Google via Serper API for company overview, funding rounds, news, and competitive landscape.",
    tag: "web_search",
  },
  {
    icon: "📄",
    name: "Page scraper",
    desc: "Fetches and parses full article content from news sites and press releases using Cheerio.",
    tag: "scrape_url",
  },
  {
    icon: "📊",
    name: "Screener.in",
    desc: "Pulls P/E ratio, market cap, revenue, and profit for Indian listed companies directly.",
    tag: "screener_search",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Enter a company name",
    desc: "Type any company — Indian or global, listed or startup. Zepto, Apple, HDFC Bank, Stripe. The agent handles all of them.",
    chip: null,
  },
  {
    num: "02",
    title: "Agent plans its research",
    desc: "The LLM decides what to search — business model, financials, founders, recent news — then calls tools to gather data. Watch every step live in the thought process panel.",
    chip: "🧠 llama-3.3-70b on Groq",
  },
  {
    num: "03",
    title: "Tools run and return results",
    desc: "Web search, page scraping, and Screener.in queries execute in sequence. Results are passed back to the LLM for the next decision.",
    chip: null,
  },
  {
    num: "04",
    title: "Verdict is generated",
    desc: "The analyst node synthesises all findings into a structured report — INVEST or PASS with confidence score, strengths, risks, financials, and full reasoning.",
    chip: null,
  },
];

const ACCURACY = [
  { label: "Correct INVEST calls", pct: 80, type: "invest", note: "On large-cap, well-documented companies" },
  { label: "Correct PASS calls", pct: 85, type: "pass", note: "On distressed companies with clear red flags" },
  { label: "Indian listed companies", pct: 75, type: "invest", note: "Enhanced by Screener.in financial data" },
  { label: "Startups / private", pct: 60, type: "pass", note: "Limited by less available public data" },
];

const EXAMPLES = [
  {
    company: "Zepto",
    verdict: "INVEST",
    confidence: 78,
    summary: "Fast-growing quick-commerce leader with $1.4B raised and an IPO filing underway at a $5B valuation.",
  },
  {
    company: "Infosys",
    verdict: "INVEST",
    confidence: 82,
    summary: "Blue-chip IT services with $18B+ revenue, 21% net margins, and a global Fortune 500 client base.",
  },
  {
    company: "Byju's",
    verdict: "PASS",
    confidence: 91,
    summary: "Active insolvency proceedings, $1.2B debt default, auditor resignation, and criminal investigations.",
  },
];

const s = {
  // layout
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
    fontFamily: "'Inter', sans-serif",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 48px",
    background: "rgba(10,14,26,0.88)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
  },
  navLogo: { fontWeight: 700, fontSize: 16, letterSpacing: "-0.3px" },
  navLogoAccent: { color: "var(--accent)" },
  navBtn: {
    padding: "9px 22px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "opacity 0.15s",
  },

  // hero
  hero: {
    padding: "96px 48px 80px",
    textAlign: "center",
    borderBottom: "1px solid var(--border)",
    maxWidth: 900,
    margin: "0 auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "var(--accent)",
    background: "var(--accent-dim)",
    border: "1px solid rgba(99,102,241,0.4)",
    borderRadius: 99,
    padding: "5px 14px",
    marginBottom: 32,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent)",
  },
  h1: {
    fontSize: "clamp(30px, 5vw, 50px)",
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: "-0.03em",
    marginBottom: 20,
  },
  h1Accent: { color: "var(--accent)" },
  heroPara: {
    fontSize: 17,
    color: "var(--muted)",
    lineHeight: 1.7,
    maxWidth: 460,
    margin: "0 auto 40px",
  },
  ctaBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "14px 32px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
    transition: "opacity 0.15s, transform 0.1s",
  },

  // stats
  statsRow: {
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid var(--border)",
    borderTop: "1px solid var(--border)",
  },
  stat: {
    flex: 1,
    maxWidth: 220,
    textAlign: "center",
    padding: "36px 20px",
    borderRight: "1px solid var(--border)",
  },
  statNum: { fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" },
  statLbl: { fontSize: 13, color: "var(--muted)", marginTop: 4 },

  // section
  section: {
    padding: "68px 48px",
    borderBottom: "1px solid var(--border)",
    maxWidth: 960,
    margin: "0 auto",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--accent)",
    marginBottom: 10,
  },
  h2: { fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 10 },
  secSub: {
    fontSize: 15,
    color: "var(--muted)",
    lineHeight: 1.7,
    maxWidth: 500,
    marginBottom: 36,
  },

  // tools
  toolsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  toolCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: 22,
  },
  toolIcon: {
    fontSize: 26,
    marginBottom: 14,
    width: 44,
    height: 44,
    background: "var(--accent-dim)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toolName: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
  toolDesc: { fontSize: 13, color: "var(--muted)", lineHeight: 1.65 },
  toolTag: {
    display: "inline-block",
    marginTop: 12,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "var(--muted)",
    background: "var(--surface2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    padding: "2px 8px",
  },

  // steps
  step: {
    display: "flex",
    gap: 24,
    padding: "22px 0",
    borderBottom: "1px solid var(--border)",
  },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: "var(--muted)",
    minWidth: 32,
    paddingTop: 3,
  },
  stepTitle: { fontSize: 15, fontWeight: 600, marginBottom: 5 },
  stepDesc: { fontSize: 14, color: "var(--muted)", lineHeight: 1.65 },
  stepChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    color: "var(--accent)",
    background: "var(--accent-dim)",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: 4,
    padding: "3px 9px",
    marginTop: 10,
  },

  // accuracy
  accGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  accCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: "20px 22px",
  },
  accTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  accLabel: { fontSize: 13, color: "var(--muted)" },
  accTrack: { height: 4, background: "var(--surface2)", borderRadius: 99, overflow: "hidden" },
  accNote: { fontSize: 12, color: "var(--muted)", marginTop: 8 },
  disclaimer: {
    marginTop: 18,
    padding: "14px 18px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    fontSize: 13,
    color: "var(--muted)",
    lineHeight: 1.65,
  },

  // examples
  exGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  exCard: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    overflow: "hidden",
  },
  exHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid var(--border)",
  },
  exCo: { fontSize: 14, fontWeight: 600 },
  exBody: { padding: "14px 18px" },
  exConf: { fontSize: 12, color: "var(--muted)", marginBottom: 8 },
  exText: { fontSize: 13, color: "var(--muted)", lineHeight: 1.65 },

  // final
  final: {
    padding: "88px 48px",
    textAlign: "center",
    maxWidth: 960,
    margin: "0 auto",
  },
  finalH2: { fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 },
  finalP: { fontSize: 16, color: "var(--muted)", marginBottom: 36 },

  footer: {
    textAlign: "center",
    padding: "24px",
    borderTop: "1px solid var(--border)",
    fontSize: 12,
    color: "var(--muted)",
  },
};

export default function Landing() {
  const navigate = useNavigate();
  const barRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.width = e.target.dataset.width + "%";
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    barRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div style={s.page}>

      {/* ── NAV ── */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          AI <span style={s.navLogoAccent}>Investment</span> Agent
        </div>
        <button style={s.navBtn} onClick={() => navigate("/research")}>
          Get started →
        </button>
      </nav>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.badge}>
          <span style={s.badgeDot} />
          Powered by Groq + LangGraph
        </div>
        <h1 style={s.h1}>
          Research any company.<br />
          <span style={s.h1Accent}>Get an invest or pass verdict.</span>
        </h1>
        <p style={s.heroPara}>
          An AI agent that searches the web, reads financial data, and delivers
          a structured investment analysis — in under 30 seconds.
        </p>
        <button
          style={s.ctaBtn}
          onClick={() => navigate("/research")}
          onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Start researching →
        </button>
      </div>

      {/* ── STATS ── */}
      <div style={s.statsRow}>
        {[
          { num: "4", lbl: "focused searches per company" },
          { num: "<30s", lbl: "average analysis time" },
          { num: "3", lbl: "data tools per run" },
          { num: "Free", lbl: "no billing required" },
        ].map((st, i) => (
          <div
            key={i}
            style={{
              ...s.stat,
              ...(i === 3 ? { borderRight: "none" } : {}),
            }}
          >
            <div style={s.statNum}>{st.num}</div>
            <div style={s.statLbl}>{st.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── TOOLS ── */}
      <div style={s.section}>
        <div style={s.eyebrow}>Tools</div>
        <h2 style={s.h2}>How the agent gathers data</h2>
        <p style={s.secSub}>
          Three tools work together to build a complete picture of any company
          before the verdict is generated.
        </p>
        <div style={s.toolsGrid}>
          {TOOLS.map((t) => (
            <div key={t.name} style={s.toolCard}>
              <div style={s.toolIcon}>{t.icon}</div>
              <div style={s.toolName}>{t.name}</div>
              <div style={s.toolDesc}>{t.desc}</div>
              <div style={s.toolTag}>{t.tag}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={s.section}>
        <div style={s.eyebrow}>How it works</div>
        <h2 style={s.h2}>From company name to verdict</h2>
        <p style={s.secSub}>
          A 4-node LangGraph state machine runs the full pipeline. Each node
          has one job.
        </p>
        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              style={{
                ...s.step,
                ...(i === STEPS.length - 1 ? { borderBottom: "none" } : {}),
              }}
            >
              <div style={s.stepNum}>{step.num}</div>
              <div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
                {step.chip && <div style={s.stepChip}>{step.chip}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACCURACY ── */}
      <div style={s.section}>
        <div style={s.eyebrow}>Accuracy</div>
        <h2 style={s.h2}>What to expect</h2>
        <p style={s.secSub}>
          The agent performs best on well-covered companies. Accuracy varies by
          how much public data is available.
        </p>
        <div style={s.accGrid}>
          {ACCURACY.map((a, i) => {
            const isInvest = a.type === "invest";
            const color = isInvest ? "var(--invest)" : "var(--pass)";
            const dimColor = isInvest ? "#064e3b" : "var(--pass-dim)";
            return (
              <div
                key={a.label}
                style={{
                  ...s.accCard,
                  borderLeft: `3px solid ${color}`,
                }}
              >
                <div style={s.accTop}>
                  <div style={s.accLabel}>{a.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color }}>
                    ~{a.pct}%
                  </div>
                </div>
                <div style={s.accTrack}>
                  <div
                    ref={(el) => (barRefs.current[i] = el)}
                    data-width={a.pct}
                    style={{
                      height: "100%",
                      borderRadius: 99,
                      background: color,
                      width: 0,
                      transition: "width 1.3s ease",
                    }}
                  />
                </div>
                <div style={s.accNote}>{a.note}</div>
              </div>
            );
          })}
        </div>
        <div style={s.disclaimer}>
          ⚠️ Accuracy estimates are based on manual spot-checks across 20+
          companies. This agent is a research assistant, not a financial
          advisor. Always verify findings before making investment decisions.
        </div>
      </div>

      {/* ── EXAMPLES ── */}
      <div style={s.section}>
        <div style={s.eyebrow}>Examples</div>
        <h2 style={s.h2}>Recent analyses</h2>
        <p style={s.secSub}>
          Here's what the agent found on three well-known companies.
        </p>
        <div style={s.exGrid}>
          {EXAMPLES.map((ex) => {
            const isInvest = ex.verdict === "INVEST";
            return (
              <div key={ex.company} style={s.exCard}>
                <div style={s.exHeader}>
                  <div style={s.exCo}>{ex.company}</div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 5,
                      background: isInvest ? "#064e3b" : "var(--pass-dim)",
                      color: isInvest ? "var(--invest)" : "var(--pass)",
                    }}
                  >
                    {ex.verdict}
                  </span>
                </div>
                <div style={s.exBody}>
                  <div style={s.exConf}>
                    Confidence:{" "}
                    <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                      {ex.confidence}%
                    </span>
                  </div>
                  <div style={s.exText}>{ex.summary}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={s.final}>
        <h2 style={s.finalH2}>Ready to analyze a company?</h2>
        <p style={s.finalP}>
          Enter any company name and get a full investment analysis in under 30
          seconds.
        </p>
        <button
          style={s.ctaBtn}
          onClick={() => navigate("/research")}
          onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Get started →
        </button>
      </div>

      <footer style={s.footer}>
        Built with LangGraph · Groq · Serper · React · Node.js
      </footer>
    </div>
  );
}