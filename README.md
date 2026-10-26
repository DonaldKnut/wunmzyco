# Wunmzy Co — E-commerce Platform

Premium, mobile-first online fashion store for **Wunmzy Co** (Nigerian women's thrift & fashion), plus a protected admin dashboard. Built for eventual production at [https://wunmzyco.com](https://wunmzyco.com).

## Stack

- Next.js App Router (TypeScript strict)
- Tailwind CSS + shadcn-style UI
- PostgreSQL + Prisma
- Server-side sessions + RBAC
- Paystack payments (test/live) with a **mock provider for local development only**
- Cloudinary image storage (all uploads)
- Console or Resend email
- Vitest + Playwright

## Quick start

### 1. Prerequisites

- Node.js 20.9+
- PostgreSQL 14+ (local, Docker, or hosted)

```bash
# Optional: Docker Compose Postgres
docker compose up -d
```

If Docker is unavailable on Windows, use any hosted Postgres URL, or try:

```bash
npm run db:embedded   # embedded Postgres helper (may fail on some Windows setups)
# or
npx create-db@latest  # temporary Prisma Postgres (24h unless claimed)
```

### 2. Install & configure

```bash
npm install
cp .env.example .env
```

Set at minimum:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally |
| `PAYMENT_PROVIDER` | `mock` for local; `paystack` when credentials ready |
| `ADMIN_SETUP_TOKEN` | One-time bootstrap token |

### 3. Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Create the first admin

Never hardcode passwords. Bootstrap a `SUPER_ADMIN`:

```bash
# PowerShell
$env:ADMIN_EMAIL="owner@wunmzyco.com"
$env:ADMIN_PASSWORD="ChangeMeNow!123"
$env:ADMIN_NAME="Store Owner"
npm run admin:bootstrap
```

Uses `ADMIN_SETUP_TOKEN` from `.env`. The account is created with `mustChangePassword=true`.

### 5. Run

```bash
npm run dev
```

- Storefront: http://localhost:3000  
- Admin: http://localhost:3000/admin  

## Architecture

```
src/
  app/
    (store)/          # public storefront routes
    admin/            # protected admin dashboard
    api/              # payments, webhooks, auth, cart, uploads
  components/         # UI + storefront + admin chrome
  lib/
    auth/             # sessions, passwords
    cart/             # server cart
    delivery/         # weight-based fee calculator
    inventory/        # reservations / commit / release
    orders/           # checkout, payment verification, transitions
    payments/         # Paystack + mock providers
    email/ storage/   # provider abstractions
  server/actions/     # admin server actions
prisma/
  schema.prisma
  migrations/
  seed.ts
```

### Money & delivery

- All amounts stored as **integer kobo** (₦1 = 100 kobo). No floating-point money math.
- Delivery fees are computed **server-side** from configurable zones (Mainland, Island, Other Lagos, Other Nigeria) with base fee, included weight, and incremental bands (`Math.ceil` for partial bands).
- Checkout snapshots items, prices, discounts, delivery quote, and weight onto the order.

### Payments

1. Create pending order + stock reservation  
2. `POST /api/payments/initialize` → Paystack/mock authorization URL  
3. Verify via callback `GET /api/payments/verify` **and** webhook `POST /api/webhooks/paystack`  
4. Accept paid status only when provider confirms success, currency is NGN, and amount matches  
5. Idempotent event IDs prevent double fulfilment / double stock commit  

**Mock provider** works without Paystack keys in development and is **hard-blocked in production**.

### Paystack activation

1. Create a Paystack account and get **test** keys  
2. Set:
   ```
   PAYMENT_PROVIDER=paystack
   PAYSTACK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
   PAYSTACK_WEBHOOK_SECRET=<same as secret key unless separate>
   PAYSTACK_MODE=test
   ```
3. Webhook URL: `https://wunmzyco.com/api/webhooks/paystack`  
4. Callback URL base: `NEXT_PUBLIC_SITE_URL`  
5. For live: use `sk_live_` / `pk_live_`, set `PAYSTACK_MODE=live`, and complete a deliberate production readiness check — **no code rewrite required**

Never put secret keys in `NEXT_PUBLIC_*` variables.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production build & serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest unit/integration |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run db:*` | Prisma generate / migrate / push / seed |
| `npm run admin:bootstrap` | Create first SUPER_ADMIN |

## Security notes

- RBAC enforced on server actions and API routes (`SUPER_ADMIN`, `ADMIN`, `ORDER_MANAGER`, `INVENTORY_MANAGER`, `SUPPORT`)
- No public admin registration
- Rate limits on auth, checkout, newsletter, tracking
- Order tracking uses a **secure token**, not a guessable order number alone
- Audit log for privileged changes
- Production never enables mock payments

## Deployment (wunmzyco.com)

1. Provision Postgres; set production env vars  
2. `npm run db:migrate` (or deploy migrations in CI)  
3. Configure DNS A/CNAME for apex + `www` with HTTPS on your host (Vercel/etc.)  
4. Set `NEXT_PUBLIC_SITE_URL=https://wunmzyco.com`  
5. Configure Cloudinary + Resend when ready  
6. Register Paystack webhook + callback URLs  
7. Bootstrap admin once, then rotate `ADMIN_SETUP_TOKEN`  

This repository does **not** purchase or claim the domain.

## What works without external credentials

- Full storefront browse/search/cart UI  
- Admin UI (after bootstrap)  
- Checkout totals & delivery quotes  
- Mock payment success/failure flow  
- Console email logging (image uploads require Cloudinary credentials)

## What still needs owner accounts

- Live/test Paystack keys + webhook  
- Resend API key for real email  
- Cloudinary account + API credentials (required — all image uploads go to Cloudinary)  
- Production Postgres + domain DNS/HTTPS  

## Seed data

Seed sets delivery zones and store settings only. **No sample products** — add catalogue from `/admin/products`.

## Backups

Back up Postgres regularly (provider snapshots or `pg_dump`). All uploaded images live in Cloudinary under `wunmzyco/*` folders — include that account in your backup/retention plan.
