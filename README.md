# Da Pizza Hub — Premium Ordering Platform

A premium, animated ordering website for Da Pizza Hub, built with Next.js 14,
Tailwind CSS, and Framer Motion — following the brand's luxury dark theme,
menu, and motion specification.

---

## ⚠️ Before Going Live: Set Up Order Storage

**Orders placed on the site are only saved once `DATABASE_URL` is
configured.** Without it, the checkout page will show a clear error
("please call or WhatsApp us instead") rather than pretending the order
went through — but customers obviously shouldn't see that in production.
Follow these steps once, before launch:

1. **Create a free database** at [neon.tech](https://neon.tech) (no credit
   card required) — or use Vercel Postgres or Supabase if you prefer.
   Copy the connection string it gives you.
2. **Set environment variables** in your hosting provider (e.g. Vercel →
   Project → Settings → Environment Variables):
   ```
   DATABASE_URL=<paste your connection string>
   ADMIN_PASSWORD=<a password only your staff know>
   ADMIN_SESSION_SECRET=<run: openssl rand -base64 32>
   ```
   For local development, put the same three lines in a `.env.local` file
   in the project root (never commit this file).
3. **Create the orders table** — run this once:
   ```bash
   npm run db:init
   ```
4. **Log in to the orders dashboard** at `/admin/login` using the
   `ADMIN_PASSWORD` you set. Orders placed on the site will appear at
   `/admin/orders` within 8 seconds, with a sound alert on arrival.

That's the whole setup — no Petpooja account, no third-party ordering
service, no monthly fee. See `src/lib/db.ts` and `src/lib/adminAuth.ts`
for full details on how this works.

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The site, menu, cart, and checkout UI all run
without a database — but see the section above before treating any order
placed through checkout as real, since it won't be saved anywhere until
`DATABASE_URL` is set.

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

### ✅ Fully working right now
- Full homepage, menu, search/filter, pizza customization with live pricing
- Cart, 3-step checkout, order confirmation screen
- **Order storage + live admin dashboard** — once `DATABASE_URL` is set
  (see above), orders placed at checkout are saved and appear at
  `/admin/orders` automatically, with delivery fee/distance/deliverability
  independently recalculated server-side (never trusted from the client).
- **WhatsApp ordering** — uses WhatsApp's public `wa.me` click-to-chat links.
  Opens WhatsApp with a prefilled order summary. Works immediately on any
  deployment, no API key needed. See `src/lib/whatsapp.ts`.
- **Contact form** — sends the enquiry to the branch via WhatsApp (same
  mechanism as above) since there's no backend/CRM to receive it yet.
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
  variables. Until then, orders are saved to the database and shown on
  `/admin/orders`, but not pushed to Petpooja — this is intentional and
  logged clearly in the console, not a silent failure.

### 📝 Placeholder data you must update before launch
- **Phone number mismatch (fixed, but needs your confirmation)** — several
  pages previously showed a different phone number than the one confirmed
  in `src/data/branches.ts`. Every page now pulls from that single file,
  but you should confirm with the client which number is actually correct
  before launch.
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
- **Google review link** — points to a generic placeholder (search
  `REVIEW_LINK_TODO`); replace with your actual Google Business review
  link.

---

## Project Structure

```
src/
  app/                    Next.js App Router pages
    page.tsx              Homepage
    menu/                 Full menu with search & filters
    checkout/              3-step checkout flow
    order-confirmed/       Post-order confirmation screen
    admin/login/            Staff login page
    admin/orders/            Live orders dashboard (auth required)
    api/orders/            Order submission — validates, prices, and
                             saves to the database
    api/admin/              Admin login/logout/orders API
    api/assistant/         AI assistant response endpoint
    policies/               Privacy / Terms / Refund pages
  components/
    home/                  Homepage sections (Hero, Best Sellers, etc.)
    menu/                  Product cards, customization modal, menu page
    checkout/              Checkout stepper, forms, confirmation
    cart/                  Cart drawer
    admin/                  Live orders dashboard UI
    assistant/             AI chat widget UI
    layout/                Navbar, Footer, smooth scroll provider
  data/                    Menu, branches, categories — all real data
    pizzas.ts              Every pizza + price from the client menu PDF
    food.ts                Burgers, fries, pasta, wraps, bread, drinks
    branches.ts             Branch info — single source of truth for
                             every phone/WhatsApp/maps link on the site
  lib/
    db.ts                   Postgres connection (see setup above)
    adminAuth.ts             Password + signed-cookie session for /admin
    delivery.ts              Distance/fee/deliverability calculation —
                             used both client-side (for display) and
                             server-side (for the authoritative charge)
    whatsapp.ts            wa.me deep link builder (working)
    petpooja.ts             Petpooja integration stub (documented)
    assistant.ts            Rule-based AI assistant logic
    utils.ts                Formatting helpers
  store/
    cart.ts                 Zustand cart store + pricing calculations
  types/                   Shared TypeScript types
scripts/
  init-db.mjs              One-time script: `npm run db:init`
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
Netlify, or any Node hosting that supports Next.js 14. **Set `DATABASE_URL`,
`ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` before launch** (see "Before
Going Live" above) so orders are actually saved; add the Petpooja
environment variables only when you're ready to go live with that
integration.

