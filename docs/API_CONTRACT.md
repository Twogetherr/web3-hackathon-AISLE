# AISLE API Contract

## Response Envelope

All `/api/*` endpoints return:

```json
{
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-04-25T08:00:00.000Z",
    "requestId": "uuid"
  }
}
```

Feature exception:

- `/ai-context.json` returns the discovery document directly because the agent contract depends on that exact top-level JSON shape.

## `GET /ai-context.json`

- Auth: no
- Body: none

### Success

```json
{
  "store": "AISLE",
  "description": "Agent-friendly grocery storefront. No CAPTCHAs.",
  "endpoints": {
    "products": "/api/products",
    "search": "/api/products/search?q=",
    "recommend": "/api/agent/recommend",
    "groceryList": "/api/agent/grocery-list",
    "cart": "/api/cart",
    "checkout": "/api/checkout",
    "productPage": "/api/products/:id"
  },
  "payment": {
    "chain": "Avalanche C-Chain",
    "chainId": 43114,
    "stablecoin": "USDC",
    "contractAddress": "0x..."
  }
}
```

### Curl

```bash
curl http://localhost:3001/ai-context.json
```

## `GET /api/products`

- Auth: no
- Query: `limit`, `offset`

### Success `data`

```json
{
  "results": [],
  "total": 0,
  "limit": 20,
  "offset": 0
}
```

### Curl

```bash
curl "http://localhost:3001/api/products?limit=20&offset=0"
```

## `GET /api/products/:id`

- Auth: no
- Params: product UUID

### Success `data`

```json
{
  "id": "uuid",
  "name": "Organic Oat Milk 1L",
  "brand": "Oatly",
  "category": "beverages",
  "description": "Creamy oat milk.",
  "priceUsdc": 4.99,
  "imageUrl": "https://...",
  "inStock": true,
  "stockQty": 10,
  "rating": 4.7,
  "reviewCount": 142,
  "tags": ["organic", "vegan"],
  "providerId": "uuid",
  "providerName": "Fresh Lane"
}
```

### Error Codes

- `INVALID_ID`: `Product id must be a valid UUID.`
- `NOT_FOUND`: `Product not found.`

### Curl

```bash
curl "http://localhost:3001/api/products/10000000-0000-4000-8000-000000000001"
```

## `GET /api/products/search`

- Auth: no
- Query: `q`, `category`, `maxPrice`, `tags`

### Success `data`

```json
{
  "results": [],
  "total": 0
}
```

### Error Codes

- `INVALID_PRICE`: `maxPrice must be greater than 0.`

### Curl

```bash
curl "http://localhost:3001/api/products/search?q=milk&maxPrice=5&tags=organic,vegan"
```

## `POST /api/agent/recommend`

- Auth: no
- Rate limit: `10 req/min per IP`

### Request Body

```json
{
  "prompt": "organic oat milk under $5",
  "maxPrice": 5,
  "filters": {
    "tags": ["organic"],
    "category": "beverages"
  }
}
```

### Success `data`

```json
{
  "mode": "single",
  "recommendations": [],
  "reasoning": "One sentence.",
  "searchQuery": "organic oat milk",
  "fallback": false
}
```

### Error Codes

- `INVALID_PROMPT`: `Prompt must be between 3 and 500 characters.`
- `INVALID_PRICE`: `maxPrice must be greater than 0.`
- `OUT_OF_SCOPE`: `Prompt must be grocery-related.`
- `RATE_LIMITED`: `Too many agent requests. Please retry in 60 seconds.`

### Curl

```bash
curl -X POST "http://localhost:3001/api/agent/recommend" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"organic oat milk under $5","maxPrice":5}'
```

## `POST /api/agent/grocery-list`

- Auth: no
- Rate limit: `10 req/min per IP`

### Request Body

```json
{
  "prompt": "ingredients for chocolate cake",
  "budget": 30,
  "excludeItems": ["vanilla extract"],
  "remainingBudget": 11.6
}
```

### Success `data`

```json
{
  "mode": "list",
  "title": "Chocolate Cake - 8 ingredients",
  "items": [],
  "totalUsdc": 18.4,
  "overBudget": false,
  "budgetRemaining": 11.6,
  "fallback": false
}
```

### Error Codes

- `INVALID_PROMPT`: `Prompt must be between 3 and 500 characters.`
- `INVALID_BUDGET`: `Budget must be greater than 0.`
- `OUT_OF_SCOPE`: `Prompt must be grocery-related.`
- `RATE_LIMITED`: `Too many agent requests. Please retry in 60 seconds.`

### Curl

```bash
curl -X POST "http://localhost:3001/api/agent/grocery-list" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"ingredients for chocolate cake","budget":30}'
```

## `POST /api/cart`

- Auth: no

### Request Body

```json
{
  "cartId": "aisle-session-id",
  "productId": "uuid",
  "quantity": 1
}
```

### Success `data`

```json
{
  "id": "aisle-session-id",
  "items": [],
  "createdAt": "2026-04-25T08:00:00.000Z",
  "updatedAt": "2026-04-25T08:01:00.000Z",
  "totalUsdc": 4.99
}
```

### Error Codes

- `INVALID_CART_ID`: `cartId is required.`
- `INVALID_ID`: `Product id must be a valid UUID.`
- `INVALID_QUANTITY`: `Quantity must be an integer between 1 and 99.`
- `OUT_OF_STOCK`: `Product is out of stock.`

### Curl

```bash
curl -X POST "http://localhost:3001/api/cart" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"aisle-session-1","productId":"10000000-0000-4000-8000-000000000001","quantity":1}'
```

## `GET /api/cart/:id`

- Auth: no

### Error Codes

- `INVALID_CART_ID`: `cartId is required.`
- `NOT_FOUND`: `Cart not found.`

### Curl

```bash
curl "http://localhost:3001/api/cart/aisle-session-1"
```

## `POST /api/checkout`

- Auth: no

### Request Body

Initial request:

```json
{
  "cartId": "aisle-session-1",
  "walletAddress": "0x1111111111111111111111111111111111111111"
}
```

Finalize request:

```json
{
  "cartId": "aisle-session-1",
  "walletAddress": "0x1111111111111111111111111111111111111111",
  "txHash": "0xabc123"
}
```

### Success `data`

```json
{
  "orderId": "uuid",
  "txHash": "0xabc123",
  "amountUsdc": 4.99,
  "status": "confirmed",
  "confirmedAt": "2026-04-25T08:10:00.000Z",
  "explorerUrl": "https://testnet.snowtrace.io/tx/0xabc123",
  "unsignedTransaction": null
}
```

### Error Codes

- `INVALID_CART_ID`: `cartId is required.`
- `INVALID_WALLET_ADDRESS`: `walletAddress must be a valid EVM address.`
- `EMPTY_CART`: `Cart must contain at least one in-stock item.`
- `INSUFFICIENT_BALANCE`: `Wallet does not have enough USDC.`

### Curl

```bash
curl -X POST "http://localhost:3001/api/checkout" \
  -H "Content-Type: application/json" \
  -d '{"cartId":"aisle-session-1","walletAddress":"0x1111111111111111111111111111111111111111"}'
```

## `GET /api/orders/:id`

- Auth: no

### Error Codes

- `INVALID_ID`: `Product id must be a valid UUID.`
- `NOT_FOUND`: `Order not found.`

### Curl

```bash
curl "http://localhost:3001/api/orders/c1bb8f81-393c-4b03-a9c8-a80d365be9e9"
```
