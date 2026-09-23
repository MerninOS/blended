# Blended — storefront + admin on Shopify

Next.js 16 (App Router) implementation of the **CoRoasted Storefront** and **CoRoasted Admin**
designs in `../project/`. It's a custom storefront where Shopify handles checkout, orders,
fulfillment and inventory.

| Route | What it is |
| --- | --- |
| `/` | **Retail / Coffee Lab**: 3D carton hero, "Our coffees" or "Build your own blend", cart drawer, Shopify checkout |
| `/wholesale` | **Private label** for signed-in wholesale accounts: stocked coffee or custom blend, packaging, run size, Net 30 or card |
| `/admin/orders` | Orders board: to fulfil / roast list / all orders, order drawer with gram-level roast sheet, stage → fulfillment |
| `/admin/green` | Green catalog: the lots customers can blend (photo, cupping scores, prices, on-hand, min grams, roast) |
| `/admin/settings` | Shopify connection, setup checklist, checkout switches, webhooks, recent activity |

## Run it

```bash
npm install
cp .env.example .env.local   # leave Shopify blank for demo mode
npm run dev                  # http://localhost:3000
```

**Demo mode:** with no store credentials the app serves the design's sample catalog and orders.
Admin edits are kept in memory and checkout says it's in demo. Admin is open locally until you set
`ADMIN_PASSWORD`.

## Connect Shopify

1. **Headless channel** (Shopify admin → Sales channels → Headless): create a storefront and copy
   the **private Storefront API token**. Enable the **Customer Account API** and add
   `APP_URL/account/callback` as a callback URI and `APP_URL/wholesale` as a logout URI.
2. **Admin API:** create an app (Dev Dashboard) for your store with these scopes:
   `write_metaobject_definitions, write_metaobjects, write_products, write_publications, write_files,
   read_orders, write_orders, write_draft_orders, write_merchant_managed_fulfillment_orders,
   write_fulfillments, read_customers, read_payment_terms`. Put its client ID/secret, or a static token, in `.env.local`.
3. **Set up the store once:** Admin → Settings → **Set up store** creates the `green_lot` metaobject
   definition, the `blended.*` product metafield definitions and the `our-coffees` collection.
   **Set up + add sample coffees** also loads the design's sample catalog with photos. Then click
   **Register webhooks**. You can also run it locally: `npm run setup:shopify` (add `-- --seed` for
   the samples, `-- --webhooks` for webhooks to `APP_URL`).
4. Tag wholesale customers `wholesale`. Turn on **Net 30** payment terms in Shopify.
5. Deploy (e.g. Vercel, project root `web/`) with the same env vars, plus `SESSION_SECRET` and `ADMIN_PASSWORD`.

## How it maps onto Shopify

- **Green catalog**: `green_lot` metaobjects. Listed = `ACTIVE`, hidden = `DRAFT`, so the Storefront
  API only returns listed lots. Photos are Shopify files. Admin edits invalidate the storefront cache.
- **Our coffees**: products in the `our-coffees` collection (tag `blended-stock`), with a `Size` option
  (8 oz / 1 lb / 2 lb / 5 lb). **The variant price is the shelf price.** Roast, tasting notes,
  wholesale $/lb and reviews come from `blended.*` metafields.
- **Checkout (retail)**: the cart lives in the browser. `POST /api/checkout` re-prices everything on the
  server from the live catalog, then creates or refreshes a **draft order** and redirects to Shopify's
  hosted checkout (`invoiceUrl`). Stocked coffees are real variant lines, so inventory and reports work.
  Custom blends are custom line items priced from their ratios. The recipe travels as line-item
  properties: visible `Coffees`, `Roast`, `Size`, plus a hidden `_blend` JSON.
- **Wholesale**: Shopify customer-account sign-in (OAuth + PKCE), gated on the `wholesale` tag. The tag
  is re-checked with the Admin API on every order. **Net 30** creates a draft order with payment terms
  and completes it (payment pending). **Card** hands off to the draft's hosted checkout, so card
  numbers never touch this app. Label artwork uploads straight from the browser to Shopify Files.
- **Orders board**: reads orders tagged `blended`. Stage = `stage:roasting` / `stage:packing` tags.
  **Mark shipped** creates a real fulfillment (optional tracking; the customer email is a Settings toggle).
- **Webhooks** (`/api/webhooks/shopify`, HMAC-verified): product/metaobject changes refresh the catalog
  cache. `orders/paid` draws down green on-hand for blends and adds a `qc-hold` tag. Both are
  Settings toggles and idempotent via the `green:deducted` tag.

## Checks

```bash
npm run check        # tsc + eslint + every GraphQL document validated against Shopify's schemas
npm run schemas      # (once) download the Admin 2026-07 / Storefront / Customer Account schemas
npm run build
```
