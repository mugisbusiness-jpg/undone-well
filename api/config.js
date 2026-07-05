// GET  /api/config  → returns the saved site config (public)
// POST /api/config  → saves config (requires Authorization: Bearer <ADMIN_PASSWORD>)
// Storage: Supabase table `site_config` (single row, id = 1)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const sbHeaders = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Server not configured — set SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD env vars in Vercel." });
  }

  if (req.method === "GET") {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_config?id=eq.1&select=data`, { headers: sbHeaders });
    if (!r.ok) return res.status(502).json({ error: "Storage read failed" });
    const rows = await r.json();
    return res.status(200).json(rows[0]?.data ?? null);
  }

  if (req.method === "POST") {
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${ADMIN_PASSWORD}`) return res.status(401).json({ error: "Unauthorized" });

    const cfg = req.body;
    if (!cfg || typeof cfg !== "object") return res.status(400).json({ error: "Invalid config" });

    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_config`, {
      method: "POST",
      headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: 1, data: cfg, updated_at: new Date().toISOString() }),
    });
    if (!r.ok) return res.status(502).json({ error: "Storage write failed", detail: await r.text() });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed" });
}
