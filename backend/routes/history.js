import express from "express";
import { getAllHistory, getById, deleteById, searchHistory } from "../db.js";

const router = express.Router();

// GET /api/history
router.get("/", async (req, res) => {
  try {
    const rows = await getAllHistory();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/search?q=zepto
router.get("/search", async (req, res) => {
  try {
    const rows = await searchHistory(req.query.q || "");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/history/:id  — full data to reload a result
router.get("/:id", async (req, res) => {
  try {
    const row = await getById(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/history/:id
router.delete("/:id", async (req, res) => {
  try {
    await deleteById(Number(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;