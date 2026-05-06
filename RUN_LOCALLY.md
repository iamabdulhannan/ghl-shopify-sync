# Run locally — step by step

This is what you do *right now* to get the app running on your machine and installable on a Shopify dev store.

## 0. Prereqs

- Node.js 20+ (`node --version`)
- npm 10+
- A Shopify Partner account → https://partners.shopify.com (free, no credit card)
- A Shopify development store (created from inside Partner dashboard, free, unlimited)

## 1. Install Shopify CLI (one-time)

```bash
npm install -g @shopify/cli@latest
shopify version
```

## 2. Create the app in Partner Dashboard

1. partners.shopify.com → **Apps** → **Create app** → **Create app manually**
2. Name: `GHL Sync` (or anything you like)
3. After creation, click into the app → **Configuration** tab
4. Note the **Client ID** (starts `xxxxxxxxxxx...`) and **Client secret**

## 3. Wire local code to the Partner app

```bash
cd /Users/admin/Downloads/ghl-shopify-sync/shopify-app

# Fill in .env (already copied from .env.example)
# Open .env in your editor and set:
#   SHOPIFY_API_KEY=<Client ID from step 2>
#   SHOPIFY_API_SECRET=<Client secret from step 2>
#   DATABASE_URL=file:./prisma/dev.sqlite   ← already set
#   SHOPIFY_APP_URL=                         ← leave blank, CLI fills it

# Update shopify.app.toml line 4:
#   client_id = "<Client ID from step 2>"
```

## 4. Link & run

```bash
# Link this folder to the Partner app
npm run config:link
# Pick the app you just created

# Start dev server (Shopify CLI handles tunneling + webhook registration)
npm run dev
```

You'll see output like:
```
╭─ info ───────────────────────────────────────────────────╮
│                                                           │
│  Preview URL: https://abc-123.trycloudflare.com           │
│  GraphiQL URL: http://localhost:3457/graphiql             │
│                                                           │
│  Press p to open in browser                               │
╰───────────────────────────────────────────────────────────╯
```

## 5. Install on your dev store

1. Press `p` in the terminal — opens the Preview URL in browser
2. The page asks for your shop domain → enter `<your-dev-store>.myshopify.com`
3. Authorize the install
4. Embedded app loads inside Shopify admin
5. **First load: 14-day free trial starts automatically (test mode)**

## 6. Configure & test

1. Inside the app: **Settings** in the nav menu
2. Paste a GHL API key + Location ID (use a trial GHL account or your existing one)
3. Save
4. Place a test order in your dev store (`Bogus Gateway` for fake payment)
5. Switch to the **Dashboard** — you should see the order appear under Recent activity within 1–2 seconds
6. Open GHL → Contacts — the order's customer should be there with auto-tags

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npm run dev` says "no app linked" | Run `npm run config:link` first |
| Tunnel URL is HTTP not HTTPS | Shopify CLI handles this automatically; if missing, restart `npm run dev` |
| Embedded app shows blank page | Check browser console; usually means SHOPIFY_API_KEY mismatch between `.env` and Partner Dashboard |
| Webhook says "401 invalid hmac" | The Shopify CLI registers webhooks with the right secret — restart `npm run dev` |
| `EADDRINUSE :3000` | `lsof -ti:3000 \| xargs kill` |
| Dashboard shows 0 syncs after order | Open Settings → confirm GHL credentials saved; check `npm run dev` terminal for errors |
| GHL contact created but no tags | Check `vipThreshold` / order total; tags only fire above thresholds |

## What you should NOT do yet

- ❌ Do not submit to App Store yet — test the full flow on a dev store first
- ❌ Do not deploy to production without a real domain + privacy policy URL
- ❌ Do not invite real merchants until you've completed at least 5 successful end-to-end test orders

When you're ready to deploy & submit, see [README.md](./README.md) → "Deploying to production" section.
