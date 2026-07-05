# Undone Well — site + admin backend

Static premium site + serverless API + Supabase storage. No frameworks, no npm installs.

```
index.html      the whole site (admin panel opens with ?admin=1)
api/config.js   GET reads config · POST saves it (password-protected)
api/upload.js   uploads images to Supabase Storage (password-protected)
supabase.sql    one-time database setup
```

## 1. Supabase (5 min)
1. Create a new project at supabase.com (free tier is fine)
2. SQL Editor → paste and run `supabase.sql`
3. Storage → **New bucket** → name it `site-images` → check **Public bucket** → create
4. Project Settings → API → copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **service_role key** (the secret one — never put this in the frontend)

## 2. Vercel (5 min)
1. Push this folder to a GitHub repo (or run `vercel` in this folder with the CLI)
2. Import the repo at vercel.com → framework preset: **Other** → deploy
3. Project → Settings → **Environment Variables**, add all three:
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | your Project URL |
   | `SUPABASE_SERVICE_KEY` | your service_role key |
   | `ADMIN_PASSWORD` | a strong password you choose |
4. Redeploy (Deployments → ⋯ → Redeploy) so the env vars load

## 3. Use it
- Site: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/?admin=1` → pencil button →
  edit anything → **Save** (asks for your admin password once per session) →
  changes are live for every visitor instantly
- **Upload image** at the top of the panel stores the photo in Supabase and
  copies the URL — paste it into any image field, then Save
- **Export** downloads a JSON backup of the whole config

## 4. Custom domain
Vercel → Project → Settings → Domains → add `undonewell.com`, then point the
DNS (GoDaddy: A record `76.76.21.21` for apex, CNAME `cname.vercel-dns.com`
for www — Vercel shows the exact records).

## Notes
- First deploy shows the built-in default content until the first Save.
- Keep uploads under ~4 MB (Vercel request limit).
- To change the admin password later, just update the env var and redeploy.
- The Shopify "Shop ↗" link is editable in the admin panel under **Links**.
