<div align="center">

# 🍕 Pizzaria

### Custom Pizza Ordering & Inventory Management Platform

*Build your dream pizza — live stock, test-mode payments, real-time tracking.*

![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Realtime-Socket.IO-010101?style=flat-square&logo=socket.io)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay_Test_Mode-3395FF?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

[Features](#-features) · [Quick Start](#-quick-start) · [Demo Flow](#-demo-flow-5-minutes) · [API](#-api-reference) · [Project Structure](#-project-structure)

</div>

---

## ✨ Features

### 👤 User Side
| Feature | Details |
|---|---|
| 📝 Registration + Email Verification | Token link emailed (logged to server console in dev) |
| 🔐 JWT Login | Rate-limited, verification-gated, 7-day tokens |
| 🔑 Forgot / Reset Password | One-hour tokenised email reset links |
| 🍕 Live Menu Dashboard | Stock-based availability, auto-disabled sold-out items |
| 🧙 4-Step Pizza Builder | Base (5) → Sauce (5) → Cheese (3) → Veggies multi-select (5), with progress bar, back/next & running total |
| 🧾 Order Summary | Final review before payment |
| 💳 Razorpay Checkout (Test Mode) | Real `checkout.js` when keys set, else one-click **Simulate Success / Failure** |
| 📡 Live Order Tracking | `Order Received → In Kitchen → Sent to Delivery → Delivered` via Socket.IO + polling fallback |

### 🛠️ Admin Side
| Feature | Details |
|---|---|
| 🔒 Separate Admin Login | Hidden `/admin/login` route, `role:admin` JWT, seeded — **no public registration** |
| 📦 Inventory Dashboard | Bases, sauces, cheeses & vegetables grouped; low-stock rows highlighted ⚠️ |
| 📉 Auto-Decrement | Stock drops automatically on every paid order |
| ✏️ Manual Stock Edit | Inline stock + threshold updates per item |
| 📧 Low-Stock Email Alerts | `node-cron` job, configurable schedule/threshold, `lastAlertedAt` dedupe |
| 🗂️ Order Management | Filter by status, one-click status changes pushed live to the user |

---

## 🧰 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, React Router 6, Axios, Context API, Tailwind CSS, `socket.io-client` |
| Backend | Node.js, Express 4, Mongoose, Socket.IO, JWT, bcryptjs, Joi, helmet, cors, express-rate-limit |
| Payments | Razorpay (test mode + mock fallback) |
| Email | Nodemailer (SMTP or console-stream in dev) |
| Jobs | node-cron low-stock scanner |
| Database | MongoDB |

---

## 🚀 Quick Start

**Prerequisites:** Node 18+, MongoDB running locally (or an Atlas URI).

### 1️⃣ Backend

```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run seed                # inventory + pizza options + admin account
npm run dev                 # → http://localhost:5000
```

### 2️⃣ Frontend

```bash
cd client
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev                 # → http://localhost:5173
```

### 🔑 Demo Credentials

| Role | Email | Password | URL |
|---|---|---|---|
| Admin (seeded) | `admin@pizzaria.local` | `Admin@123` | `http://localhost:5173/admin/login` |
| User | *register your own* | — | `http://localhost:5173/register` |

> Change admin credentials in `server/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) then re-run `npm run seed:admin`.

---

## 🎬 Demo Flow (5 minutes)

1. **Register** at `/register` → grab the verification link from the **server terminal** → open it → **Login**.
2. **Build a pizza** at `/builder` — pick through all 4 steps, watch the running total.
3. **Review** at `/summary` → *Proceed to Payment* → click **Simulate Success** 🎉 → land on live tracking.
4. **Admin view**: open `/admin/login` in another window → *Orders* → move the order `In Kitchen → Sent to Delivery → Delivered` — watch the user page update **without refresh**.
5. **Inventory**: check `/admin/inventory` — stock dropped by 1 per ingredient; set any item below its threshold and run `npm run trigger:stock-check` to fire the low-stock email.

---

## 🔌 API Reference

**Auth (User)** — `POST /api/auth/register` · `GET /api/auth/verify-email/:token` · `POST /api/auth/login` · `POST /api/auth/forgot-password` · `POST /api/auth/reset-password/:token` · `GET /api/auth/me`

**Auth (Admin)** — `POST /api/admin/auth/login`

**Menu** — `GET /api/pizza-options`

**Orders (user JWT)** — `POST /api/orders` · `POST /api/orders/:id/create-payment` · `POST /api/orders/:id/verify-payment` · `GET /api/orders/my` · `GET /api/orders/:id`

**Admin (admin JWT)** — `GET /api/admin/inventory` · `PATCH /api/admin/inventory/:id` · `GET /api/admin/orders?status=` · `PATCH /api/admin/orders/:id/status`

**Health** — `GET /api/health`

### 📡 Socket Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `join` | `{ token }` or `{ adminToken }` → joins `user:<id>` / `admin` |
| Server → Admin | `order:created` | `{ orderId, totalAmount }` |
| Server → User (+Admin) | `order:status` | `{ orderId, status }` |
| Server → Admin | `stock:low` / `stock:updated` | item info |

---

## 📁 Project Structure

```
Pizzaria/
├── server/
│   └── src/
│       ├── config/      db · env · mailer · razorpay · cron
│       ├── models/      User · Admin · Order · InventoryItem · PizzaOption
│       ├── controllers/ auth · adminAuth · pizza · order · admin
│       ├── routes/      auth · admin · orders · pizza
│       ├── middleware/  auth · validators (Joi) · error handler
│       ├── services/    email · inventory decrement · stock alerts
│       └── sockets/     Socket.IO rooms & join handling
├── client/
│   └── src/
│       ├── pages/       public/ · user/ · admin/
│       ├── components/  Navbar · ProtectedRoute
│       ├── context/     Auth + Admin providers
│       ├── services/    axios instance & endpoint wrappers
│       └── hooks/       useSocket
└── README.md
```

---

## ⚙️ Configuration (`server/.env`)

| Key | Default | Purpose |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017/pizzaria` | Database |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | — / `7d` | Auth tokens |
| `RAZORPAY_MOCK` | `true` | `true` = simulate, no keys needed |
| `RAZORPAY_KEY_ID` / `_SECRET` | — | Real test-mode checkout |
| `SMTP_HOST/PORT/USER/PASS` | *(empty = console log)* | Real emails via Ethereal/Mailtrap/Gmail |
| `STOCK_CRON_SCHEDULE` | `*/10 * * * *` | Low-stock scan frequency |
| `STOCK_ALERT_COOLDOWN_MIN` | `60` | Alert dedupe window |

---

## 📜 Scripts

| | Command | Purpose |
|---|---|---|
| Server | `npm run dev` / `start` | Run API (+ sockets + cron) |
| Server | `npm run seed` | Seed inventory, options & admin |
| Server | `npm run seed:admin` | Seed admin only |
| Server | `npm run trigger:stock-check` | Manually fire low-stock scan (demo) |
| Client | `npm run dev` / `build` / `preview` | Dev / production build / preview |

---

## 🧪 Testing Notes

- **No SMTP? No problem.** With `SMTP_HOST` empty, every email (verification, reset, stock alerts) prints to the server console with clickable links — the register/forgot responses also return the dev token.
- **No Razorpay keys? No problem.** `RAZORPAY_MOCK=true` enables the Simulate Success/Failure modal. Set real test keys + `RAZORPAY_MOCK=false` for the genuine Razorpay modal.
- **No MongoDB Atlas?** Local `mongod` works out of the box.

---

<div align="center">

Made with 🍕 · MIT License · PRs welcome!

</div>
