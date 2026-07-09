// GET /api/leads — returns recent contact-form inquiries (admin only)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if ((req.headers.authorization || "") !== `Bearer ${ADMIN_PASSWORD}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const r = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc&limit=100`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) return res.status(502).json({ error: "Read failed" });
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(await r.json());
}
