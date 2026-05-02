# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run lint     # run ESLint
```

Requires `GROQ_API_KEY` in `.env.local` (see `.env.local.example`).

## Architecture

**Stack:** Next.js 16 (App Router, JS), Tailwind CSS v4, shadcn/ui, Zustand, Recharts, Groq SDK, unpdf.

**Flow:**
1. User uploads a credit card statement PDF on `/` (`app/page.js` → `components/UploadArea.jsx`)
2. `UploadArea` POSTs the file to `app/api/analyze/route.js`
3. The route extracts text via `unpdf`, sends it to Groq (`llama-3.3-70b-versatile`) with a structured prompt, and returns a categorized JSON
4. If Groq omits the `categories` array, the route computes it server-side from `transactions`
5. Result is stored in Zustand (`store/useAnalysisStore.js`) and the user is redirected to `/dashboard`
6. Dashboard (`app/dashboard/page.js`) reads from the store and renders three sections: `CategoryCards`, `ExpenseChart`, `TransactionTable`

**State:** Zustand store holds `{ data, setData, clear }`. Data lives in memory only — no persistence between sessions.

**API response shape:**
```js
{
  period: string,
  totalAmount: number,
  transactions: [{ date, description, amount, category }],
  categories: [{ name, total, count, percentage }]  // sorted by total desc
}
```

## Design System

This project uses an **editorial financial** aesthetic. When creating new components or pages, follow these rules:

- **Fonts:** `font-serif` (Instrument Serif) for financial values and section titles; default sans (Geist) for UI/body
- **Sections** replace Cards: `<section className="space-y-6">` with a serif `<h2>` and small-caps meta label
- **Buttons:** `rounded-none`; primary uses bottle green (`--primary`)
- **Labels/column headers:** `text-[11px] uppercase tracking-[0.18em] text-muted-foreground`
- **Category colors** (used consistently across cards, chart, and table dots):

```js
const CATEGORY_COLORS = {
  Alimentação: "#b3552e", Transporte: "#243b53", Entretenimento: "#6b3e6b",
  Saúde: "#4a6b3a",       Compras: "#a06b6b",    Educação: "#3e6b6b",
  Serviços: "#9b6f2e",    Viagem: "#3a6b8a",     Outros: "#5a5a5a",
};
```

- **Category icons** from `lucide-react` with `strokeWidth={1.5}`: `UtensilsCrossed`, `Car`, `Film`, `HeartPulse`, `ShoppingBag`, `BookOpen`, `Receipt`, `Plane`, `MoreHorizontal`
- **Category #1** (highest spend) always uses `bg-accent` (gold/honey) as background highlight

## Known Quirks

- `@import "shadcn/tailwind.css"` and `@import "tw-animate-css"` in `globals.css` resolve via `@tailwindcss/postcss` — they are NOT standard CSS imports. Do not move or restructure these imports.
- `--font-sans` in `@theme inline` was previously self-referencing; the `@layer base html` rule now sets `font-family` directly via `var(--font-geist-sans)` to bypass the issue.
- `unpdf` is used instead of `pdf-parse` due to Turbopack/ESM compatibility issues.

## Lighthouse CI

O job `lighthouse` na pipeline de CI audita as páginas listadas em `lighthouserc.mjs` a cada PR.

Ao adicionar uma nova página pública ao projeto, inclua a URL em `lighthouserc.mjs`:
- Adicione a URL ao array `ci.collect.url`
- Ajuste os thresholds em `ci.assert.assertions` se a página tiver características diferentes

`/dashboard` não está incluída pois requer dados no Zustand store para renderizar. Será adicionada quando testes E2E com dados mockados forem implementados.
