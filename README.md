# AI Investment Research Agent

> Built for the InsideIIM / Altuni AI Labs take-home assignment.

---

## Overview

The AI Investment Research Agent takes any company name as input, autonomously researches it across the web, and delivers a structured **INVEST or PASS** verdict — complete with confidence score, financial highlights, strengths, risks, market position, and detailed reasoning.

**What it does end to end:**
- User types a company name (e.g. "Zepto", "Infosys", "Apple")
- A LangGraph agent spins up and runs 3–4 focused web searches via the Serper API
- For Indian listed companies, it additionally queries Screener.in for financial ratios
- The LLM synthesises all gathered data and produces a structured JSON verdict
- The frontend displays the verdict in real time with scores, pros/cons, financials, and the full agent thought process

---

## How to Run

### Prerequisites
- Node.js 18+
- A **Groq API key** (free — no billing required): [console.groq.com](https://console.groq.com) → API Keys → Create Key
- A **Serper API key** (free tier — 2,500 searches/month): [serper.dev](https://serper.dev)

### 1. Clone / unzip the project

```
InsideIIM/
├── backend/
└── frontend/
```

### 2. Backend setup

```bash
cd backend
```

Create a `.env` file:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
SERPER_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

You should see:
```
🚀 Backend running on http://localhost:5000
   Groq key   : ✅ set
   Serper key : ✅ set
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev      # if using Vite
# or
npm start        # if using Create React App
```

Frontend runs on `http://localhost:3000` (CRA) or `http://localhost:5173` (Vite)

### 4. Use it

Open the frontend URL, type any company name, and click **Research →**

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│  SearchBar → POST /api/research → renders results   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP POST { company }
┌───────────────────────▼─────────────────────────────┐
│               Express Backend (Node.js)              │
│                  /api/research                       │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│           LangGraph State Graph (Agent)              │
│                                                      │
│   START                                              │
│     │                                                │
│     ▼                                                │
│  [research node]  ← Groq LLM decides what to search │
│     │                                                │
│     ├── has tool calls? ──► [tools node]             │
│     │                          │ web_search          │
│     │                          │ scrape_url          │
│     │                          │ screener_search     │
│     │                          │                     │
│     │◄─────────────────────────┘ (loop max 3x)      │
│     │                                                │
│     └── done? ──► [verdict node] → JSON output      │
│                                                      │
│   END                                                │
└─────────────────────────────────────────────────────┘
```

### Agent Flow (Step by Step)

1. **Research Node** — The Groq LLM (`llama-3.3-70b-versatile`) receives the company name and a system prompt instructing it to act as an investment analyst. It decides which tools to call and with what queries.

2. **Tools Node** — Each tool call is executed manually (not via LangGraph's `ToolNode` — see trade-offs). Three tools are available:
   - `web_search` — hits the Serper API (Google Search wrapper), returns top 5 results with titles, snippets, and URLs
   - `scrape_url` — fetches and parses the content of a specific URL using Cheerio, useful for getting full article text
   - `screener_search` — queries Screener.in for Indian listed companies, extracts P/E ratio, market cap, revenue, profit etc.

3. **Loop** — The graph loops back to the research node after each tool execution, letting the LLM review results and decide if more searching is needed. Capped at 3 iterations to control API usage.

4. **Verdict Node** — A final LLM call synthesises all tool results into a structured JSON object with: verdict, confidence score, strengths, risks, financials, market position, founder background, recent news, and recommendation.

5. **Response** — The Express route returns the verdict + thought steps array to the frontend for rendering.

### Key Files

```
backend/
├── agent/
│   ├── researchAgent.js   # LangGraph state graph — the core agent
│   ├── tools.js           # web_search, scrape_url, screener_search
│   └── prompts.js         # system prompt + verdict JSON format prompt
├── routes/
│   ├── research.js        # POST /api/research
│   └── history.js         # GET/DELETE /api/history
├── db.js                  # In-memory history store
└── server.js              # Express app entry point

frontend/
└── src/
    ├── App.jsx
    └── components/
        ├── SearchBar.jsx
        ├── VerdictBanner.jsx
        ├── ResearchCard.jsx
        ├── AgentThoughts.jsx   # collapsible thought process panel
        └── LoadingSteps.jsx
```

---

## Key Decisions & Trade-offs

### LLM: Groq (llama-3.3-70b-versatile) over Gemini / GPT-4

| | Gemini free | OpenAI | Groq ✅ |
|---|---|---|---|
| Cost | Free | Paid | **Free** |
| Daily limit | 20–50 req/day | Paid credits | ~14,400 req/day |
| Tool calling | ✅ | ✅ | ✅ |
| Speed | Medium | Medium | Very fast |

Gemini's free tier (`gemini-2.5-flash`) caps at 20 requests/day. Since one research run uses 4 LLM calls, you'd burn through the quota in 5 searches. Groq's free tier is orders of magnitude more generous and requires no billing setup.

### LangGraph `StateGraph` over `createReactAgent`

Using the full `StateGraph` API (defining explicit nodes and edges) rather than `createReactAgent` was a deliberate choice. It gives:
- **Visibility** — each node's output is captured as a `thoughtStep` and sent to the frontend, enabling the live agent thought process panel
- **Control** — the routing logic (`shouldContinue`) can be customised; we cap at 3 iterations to avoid runaway API calls
- **Debuggability** — named nodes (`research`, `tools`, `verdict`) make stack traces meaningful

### Manual Tool Execution over `ToolNode`

LangGraph's built-in `ToolNode` produces messages with `undefined` type when used with `@langchain/langgraph ^0.2.x` and Groq's response format. This causes a hard crash (`Unknown message type: undefined`). The fix is to manually invoke each tool and construct `ToolMessage` objects with explicit `tool_call_id`, `name`, and `content` fields. This is more code but completely reliable.

### In-Memory History over Supabase

The project originally used Supabase for persistent history. Removed for zero-dependency setup — no database account, no schema, no credentials needed to run the project. History works fine in memory during a session. The `db.js` interface (`saveResearch`, `getAllHistory`, `getById`, `deleteById`) is preserved so swapping Supabase back in is a one-file change.

### Serper for Web Search over direct Google API

Serper wraps Google Search into a simple POST request with no OAuth, no quota dashboard complexity, and a free tier of 2,500 searches/month. A single research run uses 4 searches, so the free tier covers ~600 company analyses per month.

### What Was Left Out

- **Real-time stock prices** — would need a paid API (Alpha Vantage, Yahoo Finance). Added as a future improvement.
- **PDF report export** — deferred in favour of getting core accuracy right first.
- **Side-by-side company comparison** — useful feature, needs UI redesign.
- **Persistent storage** — Supabase was removed for simplicity; SQLite would be a good middle ground.
- **Streaming responses** — the frontend waits for the full result. SSE streaming of thought steps as they happen would feel much faster.

---

## Example Runs

### 1. Zepto — INVEST

```
Verdict:     INVEST
Confidence:  78%

Summary:
Zepto is a fast-growing Indian quick-commerce startup delivering groceries in
10 minutes. Strong unit economics and rapid expansion make it an attractive bet
in India's booming quick-commerce market.

Strengths:
• Achieved profitability at the city level ahead of competitors
• Raised $1B+ at a $3.6B valuation with top-tier backers (Y Combinator, Nexus)
• 10-minute delivery model with strong customer retention

Risks:
• Intense competition from Blinkit (Zomato), Swiggy Instamart, and BigBasket
• High cash burn for dark store expansion
• Regulatory uncertainty around gig worker classification

Financials:
Revenue      : ~₹2,300 Cr (FY24, growing rapidly)
Funding      : $1.4B raised across multiple rounds
Valuation    : $3.6B (2024)
Profitability: Not yet profitable at consolidated level

Market Position : #3 in Indian quick-commerce behind Blinkit and Swiggy Instamart
Founder         : Aadit Palicha and Kaivalya Vohra, IIT/Stanford dropouts, age 22
Recent News     : Zepto filed DRHP for IPO in 2025 at a $5B target valuation

Recommendation:
High-risk, high-reward bet on India's quick-commerce boom. Suitable for investors
with a 3-5 year horizon who believe in the category's long-term growth.
```

---

### 2. Infosys — INVEST

```
Verdict:     INVEST
Confidence:  82%

Summary:
Infosys is a blue-chip Indian IT services giant with $18B+ revenue, consistent
profitability, and strong dividend history. A safe, steady investment for
risk-averse portfolios.

Strengths:
• Consistent revenue growth and 20%+ operating margins
• Strong client relationships with Fortune 500 companies globally
• Robust dividend payout and share buyback history

Risks:
• Slowing deal wins in a cautious global IT spending environment
• Attrition challenges and rising wage costs
• USD revenue exposure with INR appreciation risk

Financials:
Revenue      : $18.6B (FY24)
Funding      : Publicly listed (NSE: INFY, NYSE: INFY)
Valuation    : ~$75B market cap
Profitability: Profitable — ~21% net margin

Market Position : #2 Indian IT services company behind TCS
Founder         : N R Narayana Murthy; current CEO Salil Parekh since 2018
Recent News     : Signed $2B deal with a major European utility company in Q1 FY25

Recommendation:
Solid long-term hold for steady returns. Not a high-growth play but reliable
income through dividends and moderate capital appreciation.
```

---

### 3. Byju's — PASS

```
Verdict:     PASS
Confidence:  91%

Summary:
Byju's is India's once-largest edtech unicorn now engulfed in financial fraud
allegations, mass layoffs, and insolvency proceedings. Avoid.

Strengths:
• Large historical user base of 150M+ registered learners
• Strong brand recall in India's K-12 segment
• Early mover advantage in India's edtech space

Risks:
• NCLT insolvency proceedings initiated by creditors
• $1.2B TLB default and ongoing US lender litigation
• Auditor resignation, SEBI investigation, and financial statement delays

Financials:
Revenue      : FY22 revenue disputed — auditor refused to sign off
Funding      : $5.8B raised but funds alleged to be misappropriated
Valuation    : Written down from $22B to near zero by investors
Profitability: Not profitable; heavy cash burn with no clear path to recovery

Market Position : Lost market share rapidly to PhysicsWallah, Vedantu, Unacademy
Founder         : Byju Raveendran — facing personal insolvency and fraud allegations
Recent News     : Supreme Court admitted insolvency plea; Riju Raveendran arrested

Recommendation:
Do not invest under any circumstances. The company is in active insolvency
proceedings with multiple criminal investigations ongoing against the founders.
```

---

## What I Would Improve With More Time

**1. Real financial data integration**
Connect to Alpha Vantage or Yahoo Finance for live stock prices, P/E ratios, and earnings data. Currently relies on web search snippets which can be stale.

**2. Streaming thought process**
Stream agent thought steps to the frontend via SSE as they happen, rather than waiting for the full result. Would make the UI feel much faster (currently 15–30s wait).

**3. Persistent history with SQLite**
Replace in-memory storage with SQLite (via `better-sqlite3`) — zero setup like in-memory but survives server restarts. Supabase is overkill for a local project.

**4. Side-by-side comparison mode**
Let users input two companies and compare their scores, financials, and verdicts in a split-screen view — useful for "Zepto vs Blinkit" type decisions.

**5. Confidence calibration**
The current confidence score is LLM-generated and can be overconfident. A proper calibration layer would cross-reference source count, recency, and data completeness before outputting confidence.

**6. Source citations in UI**
Show which URLs the agent actually read for each claim, so users can verify the reasoning themselves.

**7. Sector-aware prompting**
Different sectors need different research angles — a bank needs NPA ratios, a SaaS company needs ARR and churn, a consumer brand needs GMV. A sector detection step before research would improve verdict quality significantly.

**8. Vercel + Railway deployment**
Frontend on Vercel, backend on Railway — the project is ready for this, just needs environment variables configured.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, CSS Variables |
| Backend | Node.js, Express |
| AI Agent | LangGraph (`StateGraph`), LangChain.js |
| LLM | Groq — `llama-3.3-70b-versatile` (free) |
| Web Search | Serper API (Google Search wrapper) |
| Web Scraping | Axios + Cheerio |
| Financial Data | Screener.in (Indian listed companies) |
| Storage | In-memory (session-scoped history) |