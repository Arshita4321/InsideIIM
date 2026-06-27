import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, END, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ALL_TOOLS } from "./tools.js";
import { SYSTEM_PROMPT, VERDICT_PROMPT } from "./prompts.js";

// ── Helper: safely convert any LangChain message content to a plain string ───
// Gemini sometimes returns content as an array of content blocks, not a string.
// Rendering a raw array/object as React children causes a blank page crash.
function contentToString(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") return block;
        if (block && typeof block === "object") {
          // Handle {type: "text", text: "..."} blocks from Gemini
          return block.text || block.content || JSON.stringify(block);
        }
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }
  // Fallback for any other type
  return String(content);
}

// ── State shape ──────────────────────────────────────────────────────────────
const graphState = {
  messages: {
    value: (existing, incoming) => [...existing, ...incoming],
    default: () => [],
  },
  researchNotes: {
    value: (_, incoming) => incoming,
    default: () => "",
  },
  thoughtSteps: {
    value: (existing, incoming) => [...existing, ...incoming],
    default: () => [],
  },
  iterationCount: {
    value: (_, incoming) => incoming,
    default: () => 0,
  },
  finalVerdict: {
    value: (_, incoming) => incoming,
    default: () => null,
  },
};

// ── LLM setup ────────────────────────────────────────────────────────────────
function buildLLM() {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0.1,   // Lower temp = more consistent verdicts
    maxOutputTokens: 2048,
    topP: 0.95,
  });
}

// ── Node 1: Research Node ────────────────────────────────────────────────────
async function researchNode(state) {
  const llm = buildLLM();
  const llmWithTools = llm.bindTools(ALL_TOOLS);

  const response = await llmWithTools.invoke(state.messages);

  // FIX: Always convert content to a plain string before storing it.
  // Gemini can return content as an array of blocks — rendering that as JSX crashes React.
  const contentStr = contentToString(response.content);

  const thoughtStep = {
    type: "thinking",
    content: contentStr || "Deciding next search steps…",
    toolCalls: (response.tool_calls || []).map((tc) => ({
      tool: tc.name,
      input: tc.args,
    })),
    timestamp: new Date().toISOString(),
  };

  return {
    messages: [response],
    thoughtSteps: [thoughtStep],
    iterationCount: state.iterationCount + 1,
  };
}

// ── Node 2: Tool Execution Node ──────────────────────────────────────────────
const toolNode = new ToolNode(ALL_TOOLS);

async function executeTools(state) {
  const result = await toolNode.invoke(state);

  const toolMessages = result.messages || [];
  const toolSteps = toolMessages.map((msg) => ({
    type: "tool_result",
    tool: msg.name || "unknown",
    // FIX: Also sanitize tool result content — it can be an array too
    content: contentToString(msg.content).slice(0, 400),
    timestamp: new Date().toISOString(),
  }));

  return {
    messages: result.messages,
    thoughtSteps: toolSteps,
  };
}

// ── Node 3: Verdict Node ─────────────────────────────────────────────────────
async function verdictNode(state) {
  const llm = buildLLM();

  const toolContents = state.messages
    .filter((m) => m._getType && m._getType() === "tool")
    .map((m) => contentToString(m.content))
    .join("\n\n");

  const verdictMessages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Research findings:\n${toolContents}\n\n${VERDICT_PROMPT}`
    ),
  ];

  try {
    const response = await llm.invoke(verdictMessages);
    // FIX: response.content may be an array here too — always convert first
    let text = contentToString(response.content).trim();

    // Strip markdown fences
    text = text.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();

    const verdict = JSON.parse(text);

    return {
      finalVerdict: verdict,
      thoughtSteps: [
        {
          type: "verdict",
          // FIX: ensure this is always a plain string
          content: `Final Verdict: ${String(verdict.verdict)} (${String(verdict.confidence)}% confidence)`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  } catch (err) {
    console.error("Verdict parsing failed:", err.message);
    return {
      finalVerdict: {
        verdict: "PASS",
        confidence: 30,
        summary: "Failed to generate structured verdict. Please try again.",
        strengths: [],
        risks: ["Analysis error — retry recommended"],
        financials: {
          revenue: "N/A",
          funding: "N/A",
          valuation: "N/A",
          profitability: "N/A",
        },
        marketPosition: "Unknown",
        founderBackground: "Unknown",
        recentNews: "Unknown",
        recommendation: "Analysis encountered an error. Please retry.",
      },
      thoughtSteps: [
        {
          type: "verdict",
          content: "Verdict generation failed — JSON parse error",
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }
}

// ── Routing logic ─────────────────────────────────────────────────────────────
function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  const hasToolCalls =
    lastMessage?.tool_calls && lastMessage.tool_calls.length > 0;

  if (state.iterationCount >= 6) return "verdict";
  if (hasToolCalls) return "tools";
  return "verdict";
}

// ── Build the graph ───────────────────────────────────────────────────────────
function buildGraph() {
  const graph = new StateGraph({ channels: graphState })
    .addNode("research", researchNode)
    .addNode("tools", executeTools)
    .addNode("verdict", verdictNode)
    .addEdge(START, "research")
    .addConditionalEdges("research", shouldContinue, {
      tools: "tools",
      verdict: "verdict",
    })
    .addEdge("tools", "research")
    .addEdge("verdict", END);

  return graph.compile();
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function runResearchAgent(companyName) {
  const app = buildGraph();

  const initialMessages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(
      `Research "${companyName}" as an investment opportunity. Search for:
1. Business model and what the company does
2. Revenue, funding, valuation, financial health
3. Founder and management background
4. Market position vs competitors
5. Recent news and developments
6. For Indian companies, check Screener.in for listed financials

Be thorough. Search multiple times with specific queries.`
    ),
  ];

  const result = await app.invoke({ messages: initialMessages });

  return {
    verdict: result.finalVerdict,
    thoughtSteps: result.thoughtSteps || [],
  };
}