# HDS Site Backend

Backend API for the HDS Engineering & Contractors frontend (products, orders, customers, promos, inquiries).

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm start
```

Development with auto-reload:

```bash
npm run dev
```

Server runs at **http://localhost:3001** by default. Set `PORT` in `.env` to change.

## MongoDB

This backend uses **MongoDB** (via **Mongoose**).

- If you don’t already have MongoDB running locally, you can start one with Docker:

```bash
cd backend
docker compose up -d
```

- Set `MONGODB_URI` in `backend/.env` (see `.env.example`)
- Example local URI: `mongodb://127.0.0.1:27017/hds_site`

On first run, the backend will **seed** default products/customers/orders and a default promos document if the collections are empty.

## API Base URL

- Local: `http://localhost:3001/api`
- Use this in the frontend (e.g. `VITE_API_URL=http://localhost:3001` and `fetch(\`${import.meta.env.VITE_API_URL}/api/products\`)`).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/products` | List products (shop) |
| GET | `/api/products/:id` | Get product by id |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| PATCH | `/api/products/inventory` | Bulk update inventory (admin) |
| GET | `/api/orders` | List orders (admin) |
| GET | `/api/orders/:id` | Get order (admin) |
| POST | `/api/orders` | Place order (checkout) |
| PATCH | `/api/orders/:id/status` | Update order status (admin) |
| GET | `/api/customers` | List customers (admin) |
| POST | `/api/customers/:id/block` | Block customer (admin) |
| POST | `/api/customers/:id/unblock` | Unblock customer (admin) |
| GET | `/api/promos` | Get promo codes & shipping config |
| GET | `/api/inquiries` | List inquiries (admin) |
| POST | `/api/inquiries` | Submit inquiry (contact form) |

## Data

Data is stored in MongoDB collections: `products`, `orders`, `customers`, `inquiries`, and `promos`.

## Connecting the frontend

1. In the frontend, set the API base URL (e.g. via `VITE_API_URL=http://localhost:3001` in `.env`).
2. Replace direct imports of `../data/products` and `../data/promos` with `fetch` calls to `/api/products` and `/api/promos`.
3. Replace `AdminStoreContext` localStorage and in-memory updates with API calls to the backend.
4. In Checkout, POST the order to `/api/orders` instead of `addOrder` from context.
5. In Inquiry, POST the form to `/api/inquiries` instead of only setting local state.

## Admin authentication (Google OAuth / OIDC)

This backend supports **admin login via Google** (OpenID Connect on OAuth 2.0) using a **server-side session cookie**.

### Configure

1. Create a Google OAuth Client (Web app) and set the redirect URI to:
   - `http://localhost:3001/api/auth/google/callback`
2. Copy `backend/.env.example` to `backend/.env` and fill:
   - `SESSION_SECRET`
   - `ADMIN_EMAILS` (comma-separated allowlist)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

### Routes

- Start login: `GET /api/auth/google/start?returnTo=/admin`
- Callback: `GET /api/auth/google/callback`
- Current user: `GET /api/auth/me`
- Logout: `POST /api/auth/logout`

### Protected endpoints

Admin-only API routes return:
- `401` when not logged in
- `403` when logged in but not in `ADMIN_EMAILS`
