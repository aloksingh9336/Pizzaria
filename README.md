# 🍕 Pizzaria — Pizza Ordering + Inventory Platform

Full-stack monorepo: Express + MongoDB + Socket.IO backend, React (Vite) + Tailwind frontend.

## Structure
- `/server` — Node/Express REST API, JWT auth, Razorpay test-mode, Nodemailer, node-cron, Socket.IO
- `/client` — React + React Router + Axios + Context API + Tailwind

## Prerequisites
- Node 18+, MongoDB running locally (or Atlas URI), npm

## 1. Server setup
```bash
cd server
cp .env.example .env   # (Windows: copy .env.example .env)
npm install
npm run seed           # seeds inventory + pizza options + admin
npm run dev            # http://localhost:5000
```
Seeded admin defaults (from `.env`): `admin@pizzaria.local / Admin@123`.

Individual admin seed: `npm run seed:admin`.

## 2. Client setup
```bash
cd client
cp .env.example .env
npm install
npm run dev            # http://localhost:5173
```

## 3. Test flows
1. Register at `/register` → verification link printed in **server console** + returned as `verificationToken` (dev convenience) → open `/verify-email/:token`.
2. Login → `/builder` (4 steps: base → sauce → cheese → vegetables) → `/summary` → Proceed to Payment → **Simulate Success** (mock Razorpay; real Razorpay Checkout opens automatically if `RAZORPAY_MOCK=false` + valid test keys).
3. After payment → `/tracking/:id`, status updates live via Socket.IO (polling fallback every 6–8s).
4. Admin: go to `/admin/login` (not linked in user nav) → Inventory (`/admin/inventory`: inline stock + threshold edit, low-stock highlighted) → Orders (`/admin/orders`: filter + status dropdown; changes push to user room in real time).
5. Stock auto-decrements on payment verify. Out-of-stock options show disabled in builder/landing.

## 4. Razorpay test mode
- Default `RAZORPAY_MOCK=true` → no credentials needed, use Simulate Success/Failure buttons.
- Live test: set `RAZORPAY_KEY_ID/SECRET`, `RAZORPAY_MOCK=false`; frontend loads `checkout.js` and opens real Razorpay modal.

## 5. Email (dev without SMTP)
- If `SMTP_HOST` empty, Nodemailer uses stream transport and **logs full email + links to server console**. Set real SMTP (Ethereal/Mailtrap/Gmail app password) in `.env` for actual delivery.

## 6. Low-stock cron
- Schedule via `STOCK_CRON_SCHEDULE` (default `*/10 * * * *`), cooldown `STOCK_ALERT_COOLDOWN_MIN` (dedupe via `lastAlertedAt`).
- Manual trigger for demo: `cd server; npm run trigger:stock-check` (or `node src/triggerStockCheck.js`). To force an alert, set an item's stock below threshold in admin panel, clear its `lastAlertedAt`, then run the trigger.

## API quick reference
- `POST /api/auth/register|login`, `GET /api/auth/verify-email/:token`, `POST /api/auth/forgot-password|/reset-password/:token`
- `POST /api/admin/auth/login` (role:admin JWT, no public register)
- `GET /api/pizza-options`
- `POST /api/orders`, `POST /api/orders/:id/create-payment|verify-payment`, `GET /api/orders/my|/:id`
- `GET|PATCH /api/admin/inventory[/:id]`, `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status`

## Socket events
- Client emits `join` with `{ token }` or `{ adminToken }`; server joins `user:<id>` / `admin`.
- Server emits `order:created` → admin room; `order:status` → user room (+ admin on status change); `stock:low|updated` → admin.
