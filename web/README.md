# Blended — storefront + admin on Shopify

Next.js 16 (App Router) implementation of the **CoRoasted Storefront** and **CoRoasted Admin**
designs in `../project/`. It's a custom storefront where Shopify handles checkout, orders,
fulfillment and inventory.

| Route | What it is |
| --- | --- |
| `/` | **Retail / Coffee Lab**: 3D carton hero, "Our coffees" or "Build your own blend", cart drawer, Shopify checkout |
| `/wholesale` | **Private label** for signed-in wholesale accounts: stocked coffee or custom blend, packaging, run size, card checkout |
| `/admin/orders` | Orders board: to fulfil / roast list / all orders, order drawer with gram-level roast sheet, stage → fulfillment |
| `/admin/green` | Green catalog: the lots customers can blend (photo, cupping scores, prices, stock, min grams, roast) |
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
   `write_products, write_inventory, read_locations, write_publications, write_files, read_metaobjects,
   read_orders, write_orders, write_draft_orders, write_merchant_managed_fulfillment_orders,
   write_fulfillments, read_customers`. Put its client ID/secret, or a static token, in `.env.local`.
3. **Set up the store once:** Admin → Settings → **Set up store** creates the `blended.*` product
   metafield definitions and the `our-coffees` collection. It also moves green lots saved by older
   versions (`green_lot` metaobjects) into products.
   **Set up + add sample coffees** also loads the design's sample catalog with photos. Then click
   **Register webhooks**. You can also run it locally: `npm run setup:shopify` (add `-- --seed` for
   the samples, `-- --webhooks` for webhooks to `APP_URL`).
4. Tag wholesale customers `wholesale`.
5. Deploy (e.g. Vercel, project root `web/`) with the same env vars, plus `SESSION_SECRET` and `ADMIN_PASSWORD`.

## How it maps onto Shopify

- **Green catalog**: each lot is a product tagged `blended-green` (type "Green coffee") with one
  inventory-tracked variant. **Its stock is Shopify inventory counted in grams** at the primary location
  (or `SHOPIFY_LOCATION_ID`), so receiving, counts, adjustments and history happen in Shopify like any
  product. Listed = active, hidden = draft, deleted = archived. The product is never on a sales channel;
  the app reads it with the Admin API. Other details (origin, prices, notes, min grams…) are `blended.*` metafields.
- **Green stock and orders**: checkout refuses a blend that needs more green than is available. When an
  order is placed (`orders/create`), the app deducts each blend's green (roast loss included) with
  `inventoryAdjustQuantities`, referencing the order and using an idempotency key, then tags it
  `green:deducted`. `orders/cancelled` puts it back (`green:restocked`). Editing "on hand" in the admin is a
  compare-and-set, so an order deducting at the same moment is never overwritten.
- **Our coffees**: products in the `our-coffees` collection (tag `blended-stock`), with a `Size` option
  (8 oz / 1 lb / 2 lb / 5 lb). **The variant price is the shelf price.** Roast, tasting notes,
  wholesale $/lb and reviews come from `blended.*` metafields.
- **Checkout (retail)**: the cart lives in the browser. `POST /api/checkout` re-prices everything on the
  server from the live catalog, then creates or refreshes a **draft order** and redirects to Shopify's
  hosted checkout (`invoiceUrl`). Stocked coffees are real variant lines, so inventory and reports work.
  Custom blends are custom line items priced from their ratios. The recipe travels as line-item
  properties: visible `Coffees`, `Roast`, `Size`, plus a hidden `_blend` JSON.
- **Wholesale**: Shopify customer-account sign-in (OAuth + PKCE), gated on the `wholesale` tag. The tag
  is re-checked with the Admin API on every order. Orders are paid by card: the app creates a draft
  order and hands off to its hosted checkout, so card numbers never touch this app. Label artwork uploads straight from the browser to Shopify Files.
- **Orders board**: reads orders tagged `blended`. Stage = `stage:roasting` / `stage:packing` tags.
  **Mark shipped** creates a real fulfillment (optional tracking; the customer email is a Settings toggle).
- **Webhooks** (`/api/webhooks/shopify`, HMAC-verified): product and inventory changes refresh the catalog
  cache. `orders/create` / `orders/cancelled` move green stock (above). `orders/paid` adds a `qc-hold` tag
  to custom blends. Both are Settings toggles.

## Analytics, SEO and marketing

- **Consent banner** (first visit, re-open from the footer): analytics and marketing are off until the
  visitor accepts. With `SHOPIFY_STOREFRONT_PUBLIC_TOKEN` set, the choice is shared with Shopify
  checkout through the Customer Privacy API.
- **Shopify analytics**: page views, coffee views and add-to-carts are sent to Shopify
  (`@shopify/hydrogen-react`), so Analytics shows sessions and the funnel for this storefront. Needs
  analytics consent; set `SHOPIFY_STOREFRONT_ID` to attribute them to the Headless storefront.
- **Vercel Web Analytics + Speed Insights**: cookieless, always on. Turn both on in the Vercel project.
  Custom events: `add_to_cart`, `begin_checkout`.
- **Klaviyo** (`KLAVIYO_PUBLIC_KEY`): onsite script with marketing consent; `Viewed Product`,
  `Added to Cart`, `Started Checkout` events; footer signup posts to `KLAVIYO_LIST_ID`.
- **SEO**: a page per coffee (`/coffees/[handle]`) with Product structured data, canonical URLs and
  share images; `sitemap.xml`, `robots.txt` (previews are noindex), `/policies/[handle]` from
  Shopify's policies (Settings → Policies).
- **Abuse protection**: Vercel BotID on checkout, wholesale and signup endpoints, plus a per-IP limit.

## Checks

```bash
npm run check        # tsc + eslint + every GraphQL document validated against Shopify's schemas
npm run schemas      # (once) download the Admin 2026-07 / Storefront / Customer Account schemas
npm run build
```
