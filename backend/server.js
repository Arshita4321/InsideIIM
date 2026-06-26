import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import researchRoutes from "./routes/research.js";

dotenv.config(); // loads backend/.env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json());

app.use("/api/research", researchRoutes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Gemini key: ${process.env.GEMINI_API_KEY ? "✅ set" : "❌ missing"}`);
  console.log(`   Serper key: ${process.env.SERPER_API_KEY ? "✅ set" : "❌ missing"}\n`);
});