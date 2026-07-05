// POST /api/upload  → uploads an image to Supabase Storage bucket `site-images`
// Body: { name, type, data } where data is base64 (no data: prefix)
// Requires Authorization: Bearer <ADMIN_PASSWORD>. Returns { url }.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BUCKET = "site-images";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!SUPABASE_URL || !SERVICE_KEY || !ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Server not configured" });
  }
  const auth = req.headers.authorization || "";
  if (auth !== `Bearer ${ADMIN_PASSWORD}`) return res.status(401).json({ error: "Unauthorized" });

  const { name = "image", type = "image/jpeg", data } = req.body || {};
  if (!data) return res.status(400).json({ error: "No file data" });
  if (!type.startsWith("image/")) return res.status(400).json({ error: "Images only" });

  const safe = name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "").slice(-60) || "image.jpg";
  const path = `${Date.now()}-${safe}`;
  const buf = Buffer.from(data, "base64");

  const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": type,
      "x-upsert": "true",
    },
    body: buf,
  });
  if (!r.ok) return res.status(502).json({ error: "Upload failed", detail: await r.text() });

  return res.status(200).json({ url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}` });
}
