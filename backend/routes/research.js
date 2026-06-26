import express from "express";
import { runResearchAgent } from "../agent/researchAgent.js";

const router = express.Router();

// POST /api/research
router.post("/", async (req, res) => {
  const { company } = req.body;

  if (!company || company.trim().length < 2) {
    return res.status(400).json({ error: "Company name is required." });
  }

  try {
    console.log(`\n🔍 Starting research for: ${company}`);
    const startTime = Date.now();

    const result = await runResearchAgent(company.trim());

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Research complete in ${duration}s — Verdict: ${result.verdict?.verdict}`);

    res.json({
      company: company.trim(),
      ...result,
      duration,
    });
  } catch (err) {
    console.error("Research failed:", err.message);
    res.status(500).json({
      error: "Research failed. Check your API keys and try again.",
      details: err.message,
    });
  }
});

export default router;