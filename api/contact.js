// POST /api/contact — public contact form. Saves lead to Supabase `leads` table.
// Optional email notification via Resend if RESEND_API_KEY is set.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ error: "Server not configured" });

  const { name = "", contact = "", service = "", message = "", web = "" } = req.body || {};
  // honeypot: bots fill the hidden field — pretend success, save nothing
  if (web) return res.status(200).json({ ok: true });
  if (!name.trim() || !contact.trim() || !message.trim()) return res.status(400).json({ error: "Missing fields" });
  const clip = (t, n) => String(t).slice(0, n);

  const lead = {
    name: clip(name, 120),
    contact: clip(contact, 160),
    service: clip(service, 120),
    message: clip(message, 2000),
  };

  const r = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!r.ok) return res.status(502).json({ error: "Could not save" });

  // Optional email notification (set RESEND_API_KEY + verify domain at resend.com)
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || "Undone Well <onboarding@resend.dev>",
          to: [process.env.CONTACT_TO || "info@undonewell.com"],
          subject: `New inquiry — ${lead.service || "General"} — ${lead.name}`,
          text: `Name: ${lead.name}\nContact: ${lead.contact}\nService: ${lead.service}\n\n${lead.message}`,
        }),
      });
    } catch (e) { /* email is best-effort; the lead is already saved */ }
  }

  return res.status(200).json({ ok: true });
}
