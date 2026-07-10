import express from "express";
import { runResearchAgent } from "../agent/researchAgent.js";
import { saveResearch } from "../db.js";

const router = express.Router();

// POST /api/compare — runs research on two companies in parallel
router.post("/", async (req, res) => {
  const { company1, company2 } = req.body;

  if (!company1 || company1.trim().length < 2) {
    return res.status(400).json({ error: "First company name is required." });
  }
  if (!company2 || company2.trim().length < 2) {
    return res.status(400).json({ error: "Second company name is required." });
  }

  try {
    console.log(`\n🔍 Starting comparison research for: ${company1} vs ${company2}`);
    const startTime = Date.now();

    // Run both research agents in parallel
    const [result1, result2] = await Promise.all([
      runResearchAgent(company1.trim()),
      runResearchAgent(company2.trim()),
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ Comparison complete in ${duration}s`);

    // Save both to history (non-blocking)
    Promise.all([
      saveResearch({ company: company1.trim(), verdict: result1.verdict, duration }),
      saveResearch({ company: company2.trim(), verdict: result2.verdict, duration }),
    ])
      .then((rows) => console.log(`💾 Saved both comparisons to history`))
      .catch((err) => console.warn("⚠️  Supabase save failed (non-fatal):", err.message));

    res.json({
      company1: {
        company: company1.trim(),
        ...result1,
      },
      company2: {
        company: company2.trim(),
        ...result2,
      },
      duration,
    });
  } catch (err) {
    console.error("Comparison failed:", err.message);
    res.status(500).json({
      error: "Comparison failed. Check your API keys and try again.",
      details: err.message,
    });
  }
});

export default router;
