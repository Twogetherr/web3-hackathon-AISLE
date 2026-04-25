# AISLE Project Overview

## Problem

The modern web assumes a human is always on the other side. Grocery shopping still means login walls, tab chaos, inconsistent layouts, cookie banners, and flows that are difficult for agents to operate programmatically. That breaks both autonomous shopping and efficient human comparison shopping.

## Solution

AISLE is an agent merchant storefront built from the ground up for two users at once:

- human shoppers who want the best-priced match for a prompt or recipe
- AI agents that need structured discovery, structured search, and structured checkout

AISLE solves that with:

- `/ai-context.json` discovery for agents
- structured product, recommendation, grocery-list, cart, and checkout APIs
- prompt-driven shopping for humans
- recipe-mode ingredient matching with running budget math
- anonymous session carts with no login requirement
- USDC checkout shaped for Avalanche

## Why Avalanche C-Chain

Avalanche gives AISLE a credible stablecoin checkout story with standard EVM tooling. MetaMask integration is straightforward, ERC-20 transfer construction is familiar, and Fuji provides a practical demo path while keeping the implementation aligned with C-Chain judging.

## Why Agent-First

AISLE does not treat agent access as an afterthought. Instead of forcing agents to scrape HTML designed for mouse clicks, it offers:

- CORS-open machine-readable discovery
- stable endpoint shapes
- no CAPTCHA or account wall
- deterministic fallback behavior when AI ranking is unavailable

That makes the storefront usable by assistants, autonomous shopping agents, and human users in the same system.

## Demo Story

Human path:

- shopper enters `I want to bake a chocolate cake, budget $30`
- AISLE builds a matched ingredient list
- shopper removes items they already own
- totals recalculate instantly
- shopper opens a product page or clicks `Buy Now`
- checkout opens in-context
- transaction is prepared for Avalanche/Fuji signing

Agent path:

- agent hits `/ai-context.json`
- agent calls `/api/agent/recommend` or `/api/agent/grocery-list`
- agent adds to cart with `/api/cart`
- agent finalizes checkout through `/api/checkout`

## Prize Alignment

### C-Chain Track ($1,000)

AISLE directly demonstrates a USDC payment flow designed around Avalanche-compatible signing and transaction confirmation. The payment rail is not decorative; it is core to the shopping flow.

### NewMoney Merchant Tools Track ($500)

AISLE is merchant infrastructure for an agent-driven future. It gives merchants a storefront shape that agents can actually use without brittle browser automation, which is exactly the kind of merchant tooling shift this track rewards.

## Current State

The project currently runs locally with:

- a live frontend and backend
- prompt-based shopping UI
- product detail route
- cart snapshots
- two-step checkout flow
- Fuji-first signing shape
- OpenAI-backed recommendation/grocery-list services with fallback behavior

On machines without PostgreSQL, AISLE falls back to in-memory demo storage so the demo path still runs locally.
