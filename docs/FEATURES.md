# AISLE Features

## Feature 0: Agent Discovery Endpoint

### Goal

Expose a CORS-open, no-auth discovery document at `/ai-context.json` so AI agents can understand the store, available endpoints, pricing range, and payment rail without scraping HTML.

### Requirements

- `GET /ai-context.json`
- No auth, no cookies, no custom headers
- Returns store metadata, endpoint map, payment config, categories, price range, and agent instructions
- If the database is unavailable, returns a degraded fallback document instead of a `500`

### Acceptance Criteria

- Returns valid JSON under `200ms`
- Agents can locate `recommend`, `groceryList`, and `checkout`
- Never hard-fails on DB outage

## Feature 1: Human Shopper Experience

### Feature 1a: Single Product Search

#### Goal

Accept a natural-language product request and show three recommendation cards with direct cart and checkout actions.

#### Requirements

- Prompt input from `3` to `500` chars
- Optional dietary filters and budget constraints
- Product cards show image, name, brand, provider, price, rating, review count, `Add to Cart`, and `Buy Now`
- Product images fall back to a grey placeholder when broken

#### Acceptance Criteria

- `oat milk under $5` returns single mode within `5s`
- `Add to Cart` updates badge immediately
- `Buy Now` opens the shared checkout flow

### Feature 1b: Grocery List And Recipe Mode

#### Goal

Detect recipe and grocery-list prompts, then render matched ingredient rows with running totals and client-side removal behavior.

#### Requirements

- Mode chosen by the AI response shape
- Each row shows ingredient, matched product, thumbnail, quantity, and line total
- Removing a row recalculates totals client-side with no API call
- Missing matches do not block the rest of the list
- Budget state shows spent, remaining, or over-budget messaging

#### Acceptance Criteria

- `ingredients for chocolate cake` returns `6-10` ingredient rows
- Removing a row updates totals instantly
- Remaining-budget follow-up appends instead of replacing

### Feature 1c: Product Page

#### Goal

Provide a dedicated `/products/:id` detail route with fuller context and direct checkout entry.

#### Requirements

- Large image, name, brand, provider, price, rating, description, tags, stock status
- Quantity selector
- `Add to Cart` and `Buy Now`
- `Buy Now` opens the checkout modal without navigating away
- Out-of-stock products disable CTAs and show a banner

#### Acceptance Criteria

- Valid product renders within `1s`
- Invalid product shows a not-found state
- `Buy Now` opens the shared checkout modal

## Feature 2: Provider Catalogue

### Goal

Seed and expose a structured grocery catalogue that both humans and AI agents query.

### Requirements

- Prisma-backed product and provider schema
- Explicit indexes on `name`, `category`, `priceUsdc`, and `tags`
- Minimum `30` products across all `10` categories
- At least `3` providers
- Chocolate-cake ingredient coverage
- At least `5` out-of-stock items and `5` unrated items

### Acceptance Criteria

- Search queries return structured envelopes
- `milk` search matches `name`, `description`, or `tags`
- Missing products return `404`
- Invalid IDs and prices return structured `400` errors

## Feature 3: AI Shopping Agent

### Goal

Provide programmatic shopping endpoints for single-item recommendation and grocery-list generation.

### Requirements

- `POST /api/agent/recommend`
- `POST /api/agent/grocery-list`
- Shared rate limit: `10 req/min per IP`
- Off-topic guard before any OpenAI call
- OpenAI JSON parsing with retry
- Fallback to deterministic catalogue behavior on timeout or malformed responses

### Acceptance Criteria

- Off-topic prompts never call OpenAI
- `organic oat milk under $5` returns structured recommendations
- `ingredients for chocolate cake` returns matched grocery-list rows
- Rate limit returns `429` with `Retry-After: 60`

## Feature 4: Wallet And Stablecoin Payment

### Goal

Enable anonymous cart checkout with USDC over Avalanche, optimized for a Fuji-first demo and shaped for C-Chain production.

### Requirements

- Cart keyed by `aisle_session_id`
- Snapshot pricing stored in cart items
- Header cart and `Buy Now` share the same checkout modal
- Backend prepares unsigned USDC transfer
- Frontend signs with MetaMask via `ethers`
- Client sends `txHash` back to finalize
- Orders persist with `confirmed`, `pending`, or `failed` status

### Acceptance Criteria

- `Buy Now` from both card and product page opens the same modal
- Insufficient balance fails before broadcast
- Confirmed payment returns order id and Snowtrace URL
- Pending confirmations are available via `GET /api/orders/:id`
