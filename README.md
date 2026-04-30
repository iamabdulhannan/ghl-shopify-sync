# GHL ↔ Shopify Sync (for Fashion Brands)

Open-source webhook bridge that syncs your **Shopify** store into **GoHighLevel (GHL)** CRM in real time. Built specifically for fashion & apparel brands — auto-tagging by category, VIP segmentation, repeat-buyer detection, and lifetime value tracking, all out of the box.

> ⚡ **Need a GHL account?** Start your free 14-day trial here → **[Get GoHighLevel](https://www.gohighlevel.com/?fp_ref=YOUR_AFFILIATE_ID)**
> *Disclosure: this is an affiliate link. Using it supports the project at no extra cost to you.*

---

## Why this exists

Most Shopify ↔ GHL connectors are paid SaaS at $29–$99/month per store. Fashion brands also need things off-the-shelf tools don't ship:

- **Category-based auto-tagging** (dresses, denim, accessories → automatic GHL tags)
- **VIP & repeat-buyer segmentation** based on lifetime spend
- **Custom fields** for marketing opt-in, currency, last-order metadata
- **Self-hosted** — you own the data and pay zero per-contact fees

This tool gives you that, free, with code you control.

## Features

- ✅ Real-time sync of Shopify customers and orders → GHL contacts
- ✅ HMAC-verified webhooks (production-safe, timing-safe comparison)
- ✅ Automatic fashion-specific tagging: `vip`, `high-value`, `first-purchase`, `repeat-buyer`, `category-dresses`, `brand-acne-studios`, etc.
- ✅ Creates GHL opportunities from paid orders for sales pipeline tracking
- ✅ Custom fields: `shopify_customer_id`, `shopify_total_spent`, `shopify_orders_count`, last-order metadata
- ✅ One-click deploy to Railway, Render, Fly.io, or Docker
- ✅ TypeScript, structured logging (pino), zod-validated config
- ✅ Fast webhook ack (200 in <100ms) so Shopify never retries

## Quickstart

### 1. Sign up for GoHighLevel

If you don't have a GHL account yet, **[start your free 14-day trial here](https://www.gohighlevel.com/?fp_ref=YOUR_AFFILIATE_ID)**. The Starter plan ($97/mo) is enough — you need API access, which is included.

### 2. Get your GHL API key

In GHL: **Settings → Business Profile → API Keys**. Copy your **Location API Key** and your **Location ID**.

### 3. Clone and configure

```bash
git clone https://github.com/iamabdalhannan/ghl-shopify-sync.git
cd ghl-shopify-sync
cp .env.example .env
# Edit .env with your GHL credentials and a Shopify webhook secret (set in step 4)
npm install
npm run dev
```

### 4. Set up Shopify webhooks

In Shopify admin: **Settings → Notifications → Webhooks**. Add webhooks pointing to your deployed URL:

| Topic | URL |
|---|---|
| `orders/create` | `https://yourapp.com/webhooks/shopify/orders-create` |
| `orders/paid` | `https://yourapp.com/webhooks/shopify/orders-paid` |
| `customers/create` | `https://yourapp.com/webhooks/shopify/customers-create` |
| `customers/update` | `https://yourapp.com/webhooks/shopify/customers-update` |

All webhooks use **JSON** format. Shopify will show you a **shared secret** once — paste it into your `.env` as `SHOPIFY_WEBHOOK_SECRET`.

### 5. Deploy

**Railway / Render / Fly.io:** push to GitHub, connect, set env vars from `.env.example`, deploy. That's it.

**Docker:**
```bash
docker build -t ghl-shopify-sync .
docker run -p 3000:3000 --env-file .env ghl-shopify-sync
```

**Local testing with Shopify webhooks:** use `ngrok http 3000` or `cloudflared tunnel` to expose your dev server.

## How fashion-specific tagging works

When an order webhook fires, the tool inspects the payload and applies tags automatically:

| Rule | Tag |
|---|---|
| Order total ≥ $500 | `vip` |
| Order total ≥ $200 | `high-value` |
| Each line item `product_type` | `category-<type>` (e.g. `category-dresses`) |
| Each line item `vendor` | `brand-<vendor>` |
| Customer's first ever order | `first-purchase` |
| Customer's 2nd+ order | `repeat-buyer` |
| Customer accepts marketing | `marketing-opt-in` |

Use these tags in GHL to trigger workflows: VIP welcome SMS, abandoned-cart sequences, category-specific drip campaigns, restock alerts.

The rules are a single function — customize them in [`src/mapping/fashion.ts`](src/mapping/fashion.ts).

## Architecture

```
Shopify webhook
    ↓ (HMAC-verified, raw body)
  server.ts ──→ handlers/orderCreated.ts ──→ mapping/fashion.ts
                                          ──→ ghl/client.ts ──→ GHL REST API
```

- HMAC verification uses `crypto.timingSafeEqual` to prevent timing attacks.
- Webhooks are acknowledged in <100ms; processing happens after `res.send()` so Shopify never retries on slow GHL responses.
- All env vars validated at boot via zod — fails fast, never half-configured.

## Roadmap

- [ ] Inventory webhook → "back in stock" SMS triggers
- [ ] Abandoned-checkout sync → GHL workflow trigger
- [ ] Bidirectional sync (GHL contact updates → Shopify customer notes)
- [ ] WooCommerce connector
- [ ] Lifecycle PLM / Centric PLM connector for techpack workflows
- [ ] Optional persistence layer (SQLite/Postgres) for retries & idempotency

## Contributing

PRs welcome. If you build a connector for another platform (WooCommerce, BigCommerce, Magento), open an issue first so we can align on the mapping interface.

## License

MIT — use it commercially, modify it, ship it inside your agency offering.

## Support the project

If this tool saved you a SaaS subscription, the best way to give back is to use **[this GHL signup link](https://www.gohighlevel.com/?fp_ref=YOUR_AFFILIATE_ID)** when you start your trial. That's how the project funds itself.

---

**Built by [Abdul Hannan](https://linkedin.com/in/iamabdalhannan)** — Senior Full-Stack Engineer specializing in fashion-tech, PLM systems, and AI-enabled SaaS. Reach out on LinkedIn for custom GHL/Shopify/PLM integration work.
