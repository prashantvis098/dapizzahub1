# Da Pizza Hub — Premium Ordering Platform

A premium, animated ordering website for Da Pizza Hub, built with Next.js 14,
Tailwind CSS, and Framer Motion — following the brand's luxury dark theme,
menu, and motion specification.

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. That's it — no database, no API keys required
to run the full site, cart, checkout, and AI assistant locally.

To build for production:

```bash
npm run build
npm run start
```

**Note:** this project uses `next/font` to load Google Fonts (Inter +
Fraunces) at build time. This requires outbound internet access to
`fonts.googleapis.com` during `npm run build` — this works on any normal
machine or hosting provider (Vercel, Netlify, etc.), but will fail in
network-restricted sandboxes.

---

## What's Real vs. What's a Stub

This matters, so please read it before showing this to a client or going live.

### ✅ Fully working right now, no setup needed
- Full homepage, menu, search/filter, pizza customization with live pricing
- Cart, 3-step checkout, order confirmation screen
- **WhatsApp ordering** — uses WhatsApp's public `wa.me` click-to-chat links.
  Opens WhatsApp with a prefilled order summary. Works immediately on any
  deployment, no API key needed. See `src/lib/whatsapp.ts`.
- **AI Assistant** — a chat widget in the bottom-right corner that answers
  real questions about menu items, prices, branches, delivery, and payment,
  grounded in the actual menu data in this codebase (`src/lib/assistant.ts`).
  It will never invent a price that isn't in the menu data.

### ⚠️ Integration point only — needs your credentials to go live
- **Petpooja** — Petpooja is a POS platform with its own API and requires a
  merchant API key + restaurant ID that only you (or your Petpooja account
  manager) can provide. `src/lib/petpooja.ts` contains the exact integration
  code, fully commented, ready to uncomment once you add
  `PETPOOJA_API_KEY` and `PETPOOJA_RESTAURANT_ID` to your environment
  variables. Until then, orders are recorded via the `/api/orders` route
  but not pushed to Petpooja — this is intentional and logged clearly in
  the console, not a silent failure.

### 📝 Placeholder data you must update before launch
- **3 of 4 branch addresses** — only the Panki branch address was present
  in your uploaded menu PDF. The other three branches in
  `src/data/branches.ts` have placeholder addresses marked
  `PANKI_BRANCH_TODO` — search for that string and fill in real details.
- **Footer "upfigure" link** — currently points to a placeholder URL.
  Update `brand.footerLink.url` in `src/data/branches.ts`.
- **Combo pricing** (the 5 "2 Burger + Fries + Coke" style combos from
  page 4 of the menu) had no listed price in the PDF — these are shown
  without pricing until you confirm the amount.
- **Privacy / Terms / Refund policy pages** — currently placeholder text
  under `src/app/policies/`. Replace with real, legally reviewed copy.
- **Google review link** — points to a generic URL; replace with your
  actual Google Business review link.

---

## Project Structure

```
src/
  app/                    Next.js App Router pages
    page.tsx              Homepage
    menu/                 Full menu with search & filters
    checkout/              3-step checkout flow
    order-confirmed/       Post-order confirmation screen
    api/orders/            Order submission + Petpooja push
    api/assistant/         AI assistant response endpoint
    policies/               Privacy / Terms / Refund pages
  components/
    home/                  Homepage sections (Hero, Best Sellers, etc.)
    menu/                  Product cards, customization modal, menu page
    checkout/              Checkout stepper, forms, confirmation
    cart/                  Cart drawer
    assistant/             AI chat widget UI
    layout/                Navbar, Footer, smooth scroll provider
  data/                    Menu, branches, categories — all real data
    pizzas.ts              Every pizza + price from the client menu PDF
    food.ts                Burgers, fries, pasta, wraps, bread, drinks
    branches.ts             Branch info (see PANKI_BRANCH_TODO notes)
  lib/
    whatsapp.ts            wa.me deep link builder (working)
    petpooja.ts             Petpooja integration stub (documented)
    assistant.ts            Rule-based AI assistant logic
    utils.ts                Formatting helpers
  store/
    cart.ts                 Zustand cart store + pricing calculations
  types/                   Shared TypeScript types
public/
  images/                  102 AI-generated food photos, organized by category
  brand/logo.png           Da Pizza Hub logo
```

---

## Design System

Matches the brand spec exactly:

| Token | Value |
|---|---|
| Background | `#090909` |
| Surface | `#121212` |
| Card | `#171717` |
| Accent (red) | `#E53935` |
| Gold accent | `#F6C453` |
| Primary text | `#FFFFFF` |
| Secondary text | `#B3B3B3` |

- **Fonts:** Fraunces (display/headlines) + Inter (body)
- **Motion:** Framer Motion for component/scroll animations, Lenis for
  smooth scrolling — both respect `prefers-reduced-motion`.
- **Spacing:** 8px baseline grid via Tailwind's default scale.

---

## Deploying

This is a standard Next.js app — deploys cleanly to Vercel (recommended),
Netlify, or any Node hosting that supports Next.js 14. No database or
external services are required for the site to function; add the Petpooja
environment variables only when you're ready to go live with that
integration.
