# Amantis Shop

Mobile-first digital catalog for **Amantis** (sex shop) — orders flow through WhatsApp, no payments processed on-site. Replaces the current "send product photos in every WhatsApp conversation" workflow with a navigable catalog and inventory control.

Linear project: https://linear.app/litoralcode/project/amantis-shop-89ee9077927f

## Stack

- **Framework:** Next.js 14 (App Router, Server Actions) · TypeScript strict
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL on Railway
- **ORM:** Prisma
- **Auth:** Auth.js
- **Storage:** Cloudflare R2 + `sharp` (WebP, multiple sizes)
- **Validation:** Zod
- **Monitoring:** Sentry
- **Hosting:** Vercel
- **Package manager:** pnpm

## Folder structure

```
app/                       # Next.js App Router routes
components/                # Shared React components
lib/                       # Client-safe utilities
server/
  actions/                 # Server Actions (mutations called from client)
  services/                # Business logic, orchestration
  repositories/            # Data access layer (Prisma queries)
  lib/                     # Server-only utilities
  validators/              # Zod schemas
```

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Command            | What it does                                |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start dev server (Turbopack)                |
| `pnpm build`       | Production build                            |
| `pnpm start`       | Run the production build                    |
| `pnpm lint`        | ESLint (`next/core-web-vitals` + Prettier)  |
| `pnpm typecheck`   | TypeScript check, no emit                   |
| `pnpm format`      | Format the repo with Prettier               |
| `pnpm format:check`| Verify formatting in CI                     |

## Branches

- `main` — production. Protected; PRs only.
- `develop` — integration branch for in-progress work.

Feature branches off `develop`, named like `feat/lit-XXX-short-slug` matching the Linear ticket.
