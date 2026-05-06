# GHL Sync — Shopify App

Embedded Shopify app that syncs orders & customers into GoHighLevel CRM with smart auto-tagging. **$9.99/mo, 14-day free trial.**


---

## What's inside

```
shopify-app/
├── app/
│   ├── shopify.server.ts          Shopify SDK + billing config
│   ├── db.server.ts               Prisma client
│   ├── entry.server.tsx           Remix SSR entry
│   ├── root.tsx                   HTML shell
│   ├── lib/
│   │   ├── ghl.server.ts          Per-shop GHL client
│   │   ├── fashion.server.ts      Tag rules
│   │   ├── sync.server.ts         Order + customer → GHL pipeline
│   │   └── types.ts
│   └── routes/
│       ├── _index/route.tsx       Public landing
│       ├── auth.$.tsx             OAuth callback
│       ├── auth.login/            Shop-domain login
│       ├── app.tsx                Embedded App Bridge layout + billing gate
│       ├── app._index.tsx         Dashboard (counts + recent activity)
│       ├── app.settings.tsx       GHL credentials + tag thresholds
│       ├── app.tags.tsx           Tag-rule reference page
│       ├── webhooks.sync.tsx      orders/customers → GHL
│       ├── webhooks.compliance.tsx GDPR (data_request, redact, shop/redact)
│       ├── webhooks.app.uninstalled.tsx
│       └── webhooks.app.scopes_update.tsx
├── prisma/schema.prisma           Session, ShopConfig, SyncLog
├── shopify.app.toml               App config (scopes, webhook subscriptions)
├── shopify.web.toml               Process config
├── vite.config.ts                 Remix + Vite
├── package.json
├── tsconfig.json
├── Dockerfile
└── .env.example
```

## Run locally

👉 **See [RUN_LOCALLY.md](./RUN_LOCALLY.md) for the full step-by-step.** Summary:

```bash
cd shopify-app
npm install                                # done
npm install -g @shopify/cli@latest         # one-time
cp .env.example .env                       # edit with Client ID/Secret from Partner Dashboard
npx prisma migrate dev --name init         # already done — DB at prisma/dev.sqlite
npm run config:link                        # link to your Partner app
npm run dev                                # opens tunnel, registers webhooks, prints install URL
```

## Deploying to production

You have two production paths. **Pick one:**

### Path A — Fly.io with SQLite (simplest, cheapest)

Best for: launch and first 1k merchants. Single command deploy. Persistent volume for SQLite.

```bash
brew install flyctl
fly auth signup                                # or fly auth login
cd shopify-app
fly launch --copy-config --no-deploy           # uses fly.toml, pick app name & region
fly volumes create data --size 1 --region <your-region>
fly secrets set \
  SHOPIFY_API_KEY=... \
  SHOPIFY_API_SECRET=... \
  SCOPES=read_orders,read_customers,read_products \
  SHOPIFY_APP_URL=https://<app-name>.fly.dev \
  DATABASE_URL=file:/data/prod.sqlite
fly deploy
```

Then update `shopify.app.toml`:
- `application_url = "https://<app-name>.fly.dev"`

Then push the new URL to your Partner Dashboard:
```bash
npm run deploy
```

**Cost:** ~$0–5/mo on Fly's hobby tier.

### Path B — Render with Postgres (managed DB, auto-deploy)

Best for: when you outgrow SQLite (~5k+ merchants) or want managed Postgres.

**Schema change required first:**
```diff
# prisma/schema.prisma
datasource db {
- provider = "sqlite"
+ provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Commit + push. Then:

1. Render dashboard → **Blueprints** → connect this repo
2. `render.yaml` is auto-detected → creates web service + Postgres DB
3. Add secrets in dashboard: `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL=https://<service>.onrender.com`
4. After first deploy, update `shopify.app.toml` `application_url` to the Render URL and run `npm run deploy`

**Cost:** $7/mo web + $7/mo Postgres = **$14/mo** (Render starter tiers).

### Path C — anywhere else (Railway, Heroku, your own VPS)

The Dockerfile in this repo is generic — any platform that runs Docker can host it. Same env vars apply.

## Submit to App Store

When you're ready to make money:

1. **Test thoroughly** on a fresh dev store — install → configure → place orders → uninstall → reinstall
2. **Add app listing assets** in Partner Dashboard:
   - App icon (1200×1200 PNG)
   - 3–5 screenshots (1600×900)
   - Demo video (90 sec, optional but boosts approval)
   - App description
   - Pricing: **Recurring**, $9.99/mo, 14-day trial
3. **Privacy policy URL** (required) — host on yourdomain.com/privacy
4. **Submit for review** — typically 4–8 weeks
5. After approval: live in the Shopify App Store, indexed by Google

## Pricing math

| Installs (paying) | Monthly revenue | After Shopify fee* | Annual |
|---|---|---|---|
| 50 | $499 | $499 (under $1M) | $5,988 |
| 200 | $1,998 | $1,998 | $23,976 |
| 500 | $4,995 | $4,995 | $59,940 |
| 2,000 | $19,980 | $16,983 (15% over $1M) | $203,796 |

*Shopify takes 0% on your first $1M lifetime app revenue, then 15%.

## Why merchants pay

- **Self-built integrations cost $1,500–5,000** to commission
- **Generic Zapier setups cost $30–100/mo + per-task fees**
- This app: **$9.99/mo flat**, no per-contact fees, fashion-aware out of the box

## License

This repo is **proprietary**. All rights reserved.
