# HDS Engineering & Contractors

Company site and e-commerce UI for **HDS Engineering & Contractors** — professionals in Stainless Steel Fabrication, Hotel & Bakery Equipment, Steel Fabrication, Elevator Renovation, and Elevator Interior Solutions.

## Features

- **Home page** — Hero, services (Stainless Steel Fabrication, Hotel & Bakery Equipment, Steel Fabrication, Elevator Renovation, Elevator Interior Solution), about, and CTA
- **Kitchenware shop** — Stainless steel kitchen products with category filters and product cards
- **Brand styling** — HDS logo colors (navy `#213570`, light background), Outfit + DM Serif Display fonts, responsive layout

## Run locally

The shop, admin API, and promos use **`/api/*`**, which Vite proxies to **port 3001** — so **Express must be running** unless every call uses an absolute URL from env.

```bash
npm install
cd backend && npm install && cd ..
```

**Option A — one command (frontend + API):**

```bash
npm run dev:full
```

**Option B — two terminals (full local stack: shop + Express + Mongo):**

```bash
npm run dev:api
```

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

**Option 2 — inquiry only via Lambda (no local API needed for the inquiry form):** Set **`VITE_INQUIRY_API_URL`** in `.env` to your API Gateway base (use **`%24default`** in the path for the `$default` stage — avoids dotenv mangling; see `docs/INQUIRY_LAMBDA.md`). In **development**, Vite proxies **`/api/inquiries`** to that URL, so you only need **`npm run dev`** to test the inquiry form. The shop and other **`/api/*`** calls still go to **port 3001** — start **`npm run dev:api`** if you use those features.

### `http proxy error` / `ECONNREFUSED` on `/api/...`

With **`VITE_SKIP_LOCAL_API=1`** in `.env` (dev only), the app skips **`/api/products`**, **`/api/orders`**, **`/api/customers`**, and **`/api/promos`** so the terminal stays quiet when the backend is off. Set **`VITE_SKIP_LOCAL_API=0`** when you run **`npm run dev:api`**. Inquiry (Lambda) is not skipped. Production builds ignore this flag.

- **`/api/products`**, **`/api/promos`**, etc.: Otherwise Vite forwards to **`localhost:3001`**. Start **`npm run dev:api`** or **`npm run dev:full`**, and fix **`MONGODB_URI`** in `backend/.env` if the API exits on startup.
- **`/api/inquiries`** with **`VITE_INQUIRY_API_URL`** set: proxied to **API Gateway** (see `vite.config.js`), not to 3001.

**Env:** For local development, **do not** set `VITE_API_URL` to API Gateway (that would send products/orders to Lambda). Use **`VITE_INQUIRY_API_URL`** for the inquiry Lambda only; leave `VITE_API_URL` unset so the proxy + Express handle the rest. For production, set `VITE_API_URL` in `.env.production` when you build.

## Build

Set `VITE_SITE_URL` in `.env` or `.env.production` so canonical URLs, Open Graph, `sitemap.xml`, and `robots.txt` use your real domain. If the deployed site should call a remote API for products/orders (not only the inquiry Lambda), set **`VITE_API_URL`** there too.

```bash
npm run build
npm run preview
```

## Logo

To use your own logo image, place it in `public/logo.png` and update the Header component to render `<img src="/logo.png" alt="HDS" />` inside the logo link. The current header uses styled text that matches the HDS brand.
