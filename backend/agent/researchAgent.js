import { ChatGroq } from "@langchain/groq";
import { StateGraph, END, START } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { ALL_TOOLS } from "./tools.js";
import { SYSTEM_PROMPT, VERDICT_PROMPT } from "./prompts.js";

const graphState = {
  messages: { value: (a, b) => [...a, ...b], default: () => [] },
  thoughtSteps: { value: (a, b) => [...a, ...b], default: () => [] },
  iterationCount: { value: (_, b) => b, default: () => 0 },
  finalVerdict: { value: (_, b) => b, default: () => null },
};

function buildLLM() {
  return new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY,
    temperature: 0.3,
    maxTokens: 4096,
  });
}

const TOOL_MAP = Object.fromEntries(ALL_TOOLS.map((t) => [t.name, t]));

function safeParseJSON(rawText) {
  let text = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON found");
  text = text.slice(start);
  try { return JSON.parse(text); } catch {}
  let depth = 0, inStr = false, esc = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) { try { return JSON.parse(text.slice(0, i + 1)); } catch {} } }
  }
  if (inStr) text += '"';
  text = text.replace(/,?\s*"[^"]*"\s*:\s*"[^"]*$/, "").replace(/,\s*$/, "");
  while (depth > 0) { text += "}"; depth--; }
  return JSON.parse(text);
}

async function researchNode(state) {
  const llm = buildLLM().bindTools(ALL_TOOLS);
  const response = await llm.invoke(state.messages);
  return {
    messages: [response],
    thoughtSteps: [{
      type: "thinking",
      content: response.content || "Deciding next steps...",
      toolCalls: (response.tool_calls || []).map((tc) => ({ tool: tc.name, input: tc.args })),
      timestamp: new Date().toISOString(),
    }],
    iterationCount: state.iterationCount + 1,
  };
}

async function executeTools(state) {
  const lastMsg = state.messages[state.messages.length - 1];
  const toolCalls = lastMsg?.tool_calls || [];
  const toolMessages = [];
  const toolSteps = [];
  for (const tc of toolCalls) {
    const fn = TOOL_MAP[tc.name];
    let result = "Tool not found.";
    if (fn) {
      try { result = await fn.invoke(tc.args); }
      catch (e) { result = `Tool error: ${e.message}`; }
    }
    const content = typeof result === "string" ? result : JSON.stringify(result);
    toolMessages.push(new ToolMessage({
      content,
      tool_call_id: tc.id || `call_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: tc.name,
    }));
    toolSteps.push({ type: "tool_result", tool: tc.name, content: content.slice(0, 300), timestamp: new Date().toISOString() });
  }
  return { messages: toolMessages, thoughtSteps: toolSteps };
}

async function verdictNode(state) {
  const llm = buildLLM();
  const toolContents = state.messages
    .filter((m) => m instanceof ToolMessage || m._getType?.() === "tool")
    .map((m) => typeof m.content === "string" ? m.content : JSON.stringify(m.content))
    .join("\n\n");
  try {
    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Research findings:\n${toolContents}\n\n${VERDICT_PROMPT}`),
    ]);
    const verdict = safeParseJSON(response.content.trim());
    const safe = {
      verdict: verdict.verdict || "PASS",
      confidence: typeof verdict.confidence === "number" ? verdict.confidence : 50,
      summary: verdict.summary || "Analysis completed.",
      strengths: Array.isArray(verdict.strengths) ? verdict.strengths : [],
      risks: Array.isArray(verdict.risks) ? verdict.risks : [],
      financials: verdict.financials || { revenue: "N/A", funding: "N/A", valuation: "N/A", profitability: "N/A" },
      marketPosition: verdict.marketPosition || "Unknown",
      founderBackground: verdict.founderBackground || "Unknown",
      recentNews: verdict.recentNews || "No recent news found.",
      recommendation: verdict.recommendation || "Insufficient data.",
    };
    return {
      finalVerdict: safe,
      thoughtSteps: [{ type: "verdict", content: `Final Verdict: ${safe.verdict} (${safe.confidence}% confidence)`, timestamp: new Date().toISOString() }],
    };
  } catch (err) {
    console.error("Verdict failed:", err.message);
    return {
      finalVerdict: {
        verdict: "PASS", confidence: 30,
        summary: "Research completed but report generation failed.",
        strengths: [], risks: ["Analysis error — please try again"],
        financials: { revenue: "N/A", funding: "N/A", valuation: "N/A", profitability: "N/A" },
        marketPosition: "Unknown", founderBackground: "Unknown",
        recentNews: "Unknown", recommendation: "Please try again.",
      },
      thoughtSteps: [{ type: "verdict", content: `Failed: ${err.message}`, timestamp: new Date().toISOString() }],
    };
  }
}

function shouldContinue(state) {
  const last = state.messages[state.messages.length - 1];
  if (state.iterationCount >= 3) return "verdict";
  if (last?.tool_calls?.length > 0) return "tools";
  return "verdict";
}

function buildGraph() {
  return new StateGraph({ channels: graphState })
    .addNode("research", researchNode)
    .addNode("tools", executeTools)
    .addNode("verdict", verdictNode)
    .addEdge(START, "research")
    .addConditionalEdges("research", shouldContinue, { tools: "tools", verdict: "verdict" })
    .addEdge("tools", "research")
    .addEdge("verdict", END)
    .compile();
}

export async function runResearchAgent(companyName) {
  const app = buildGraph();
  const result = await app.invoke({
    messages: [
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(
        `Research "${companyName}" as an investment opportunity.
Do focused searches for ONLY these 4 things (one search each):
1. "${companyName} company overview revenue business model 2024"
2. "${companyName} funding valuation investors financials"
3. "${companyName} founder CEO background"
4. "${companyName} recent news competitors market position 2024"
After these 4 searches, stop and generate the verdict. Do not search more than 4 times.`
      ),
    ],
  });
  return { verdict: result.finalVerdict, thoughtSteps: result.thoughtSteps || [] };
}