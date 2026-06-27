import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import researchRoutes from "./routes/research.js";
import historyRoutes from "./routes/history.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));
app.use(express.json());

app.use("/api/research", researchRoutes);
app.use("/api/history", historyRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Groq key   : ${process.env.GROQ_API_KEY   ? "✅ set" : "❌ missing"}`);
  console.log(`   Serper key : ${process.env.SERPER_API_KEY ? "✅ set" : "❌ missing"}\n`);
});