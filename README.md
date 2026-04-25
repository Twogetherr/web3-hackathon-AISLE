# AISLE

AISLE is an agent-first grocery storefront built for both human shoppers and AI agents. It exposes a machine-readable discovery endpoint, structured shopping APIs, prompt-driven product selection, grocery-list mode, and a stablecoin checkout flow shaped for Avalanche C-Chain and Fuji-first demos.

## Prerequisites

- Node.js `>=22.14.0 <25`
- npm `>=10.9.2 <12`
- PostgreSQL for the full Prisma-backed path
- MetaMask for the browser signing flow

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   cp .env.example server/.env
   printf 'VITE_API_BASE_URL=http://localhost:3001\n' > client/.env
   ```
3. Replace fake values with real ones for:
   - `OPENAI_API_KEY`
   - `MERCHANT_WALLET_ADDRESS`
   - `MERCHANT_WALLET_PRIVATE_KEY`
4. If PostgreSQL is available, create the database referenced by `DATABASE_URL`.

## Run The App

Use the helper script:

```bash
./run.sh
```

Or run manually:

```bash
cd server && npm run dev
cd client && npm run dev -- --host 0.0.0.0
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Agent discovery: `http://localhost:3001/ai-context.json`

## Database And Seed

Full database path:

```bash
cd server
npx prisma generate --schema ../prisma/schema.prisma
npx prisma migrate dev --schema ../prisma/schema.prisma
npm run prisma:seed
```

If PostgreSQL is not available, the current codebase falls back to an in-memory demo store for catalogue, cart, and order data so the local demo can still run.

## Tests

Run all tests:

```bash
npm test
```

Run coverage:

```bash
npm run test:coverage
```

Run typechecks:

```bash
npm run typecheck
```

## Coverage Report

Coverage is powered by Vitest in both workspaces:

- `server`: API, service, and rate-limit coverage
- `client`: component, routing, checkout modal, and error-boundary coverage

## Module Overview

| Area | Location | Purpose |
| --- | --- | --- |
| Frontend app | `client/src` | Prompt search, grocery list mode, product page, cart badge, and checkout modal |
| Backend app | `server/src` | Discovery, product, agent, cart, checkout, and order APIs |
| Prisma schema | `prisma/schema.prisma` | Product, provider, cart, cart item, and order models |
| Seed data | `prisma/seed.ts` | 30+ seeded grocery products including chocolate-cake ingredients |
| Docs | `docs` | Architecture, API contract, feature spec, and project overview |

## Current Demo Notes

- The frontend and backend are running locally at the URLs above.
- The machine-readable discovery endpoint is live.
- Product search, grocery-list mode, product detail routing, cart snapshots, and checkout modal are implemented.
- The checkout flow is Fuji-first and shaped for MetaMask signing.
- Without a real OpenAI key, AI endpoints fall back to deterministic catalogue behavior.
