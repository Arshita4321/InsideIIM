// db.js — in-memory storage (no Supabase needed)
// History resets on server restart, but works with zero setup.

const history = [];
let nextId = 1;

export async function saveResearch({ company, verdict, duration }) {
  const entry = {
    id: nextId++,
    company,
    verdict: verdict?.verdict ?? "PASS",
    confidence: verdict?.confidence ?? 0,
    summary: verdict?.summary ?? "",
    full_data: verdict,
    duration: String(duration),
    created_at: new Date().toISOString(),
  };
  history.unshift(entry); // newest first
  if (history.length > 50) history.pop(); // cap at 50
  return { id: entry.id };
}

export async function getAllHistory() {
  return history.map(({ full_data, ...rest }) => rest); // exclude full_data in list
}

export async function getById(id) {
  const entry = history.find((h) => h.id === id);
  if (!entry) throw new Error("Not found");
  return entry;
}

export async function deleteById(id) {
  const idx = history.findIndex((h) => h.id === id);
  if (idx !== -1) history.splice(idx, 1);
  return true;
}

export async function searchHistory(query) {
  const q = query.toLowerCase();
  return history
    .filter((h) => h.company.toLowerCase().includes(q))
    .map(({ full_data, ...rest }) => rest);
}

export default { saveResearch, getAllHistory, getById, deleteById, searchHistory };