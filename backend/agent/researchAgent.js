import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StateGraph, END, START } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ALL_TOOLS } from "./tools.js";
import { SYSTEM_PROMPT, VERDICT_PROMPT } from "./prompts.js";

// ── State shape ──────────────────────────────────────────────────────────────
// LangGraph tracks this object as the graph moves through nodes.
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
    temperature: 0.3,
    maxOutputTokens: 2048,
    topP: 0.95,
  });
}

// ── Node 1: Research Node ────────────────────────────────────────────────────
// The LLM decides what to search; ToolNode executes; loop continues until done.
async function researchNode(state) {
  const llm = buildLLM();
  const llmWithTools = llm.bindTools(ALL_TOOLS);

  const response = await llmWithTools.invoke(state.messages);

  const thoughtStep = {
    type: "thinking",
    content: response.content || "Deciding next steps...",
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

  // Extract tool results for thought steps
  const toolMessages = result.messages || [];
  const toolSteps = toolMessages.map((msg) => ({
    type: "tool_result",
    tool: msg.name || "unknown",
    content:
      typeof msg.content === "string"
        ? msg.content.slice(0, 300)
        : JSON.stringify(msg.content).slice(0, 300),
    timestamp: new Date().toISOString(),
  }));

  return {
    messages: result.messages,
    thoughtSteps: toolSteps,
  };
}

// ── Node 3: Verdict Node ─────────────────────────────────────────────────────
// After research is complete, synthesise everything into a structured verdict.
async function verdictNode(state) {
  const llm = buildLLM();

  const toolContents = state.messages
    .filter(m => m._getType && m._getType() === "tool")
    .map(m => typeof m.content === "string" ? m.content : JSON.stringify(m.content))
    .join("\n\n");

  const verdictMessages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(`Research findings:\n${toolContents}\n\n${VERDICT_PROMPT}`),
  ];

  try {
    const response = await llm.invoke(verdictMessages);
    let text = response.content.trim();

    // Clean markdown
    text = text.replace(/```json\s*/g, "").replace(/```\s*$/g, "").trim();

    const verdict = JSON.parse(text);

    return {
      finalVerdict: verdict,
      thoughtSteps: [{
        type: "verdict",
        content: `Final Verdict: ${verdict.verdict} (${verdict.confidence}%)`,
        timestamp: new Date().toISOString(),
      }],
    };
  } catch (err) {
    console.error("Verdict parsing failed:", err);
    return {
      finalVerdict: {
        verdict: "PASS",
        confidence: 30,
        summary: "Failed to generate structured verdict.",
        strengths: [],
        risks: ["Error in final analysis"],
        financials: { revenue: "N/A", funding: "N/A", valuation: "N/A", profitability: "N/A" },
        marketPosition: "Unknown",
        founderBackground: "Unknown",
        recentNews: "Unknown",
        recommendation: "Analysis encountered an error. Please try again."
      },
      thoughtSteps: [{
        type: "verdict",
        content: "Verdict generation failed",
        timestamp: new Date().toISOString(),
      }],
    };
  }
}

// ── Routing logic ─────────────────────────────────────────────────────────────
// If the LLM called tools → run them. If done or max iterations → verdict.
function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  const hasToolCalls =
    lastMessage?.tool_calls && lastMessage.tool_calls.length > 0;

  if (state.iterationCount >= 6) return "verdict"; // safety cap
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
    .addEdge("tools", "research") // loop back after tool use
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