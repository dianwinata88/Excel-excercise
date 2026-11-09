# Excel Practice

Hands-on, bite-sized Excel training that runs in the browser — "Duolingo for Excel" — plus a programmatic SEO content engine (function guides, how-to pages, shortcut pages).

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS 4**
- **HyperFormula** — evaluates real Excel formulas in-browser for exercise validation
- **Postgres + Prisma 7** — stores leads today, ready for progress sync if auth is added
- Content lives in `content/*.json` (zod-validated) and is statically generated at build time

## Develop

```bash
npm install          # also runs `prisma generate`
docker compose up -d # optional: local Postgres
npm run dev
```

Checks: `npm run validate:content` · `npm run lint` · `npx next typegen && npx tsc --noEmit` · `npm run build`

## Content model

| File | Powers |
|---|---|
| `content/topics.json` | `/learn/<topic>` cluster pages |
| `content/lessons.json` | `/lesson/<slug>` interactive lessons |
| `content/exercises.json` | exercise specs rendered by `ExerciseEmbed` |
| `content/functions.json` | `/functions/<fn>` programmatic pages |
| `content/tasks.json` | `/how-to/<task>` programmatic pages |
| `content/shortcuts.json` | `/shortcuts/<slug>` programmatic pages |

Schemas: `content/schema.ts`. Cross-reference integrity is checked by `npm run validate:content`.

## SEO

- `src/app/sitemap.ts` + `robots.ts` auto-generated from content
- JSON-LD (HowTo, FAQPage, BreadcrumbList, Course, WebSite) via `src/lib/seo.ts`
- Canonical/OG/Twitter metadata via `buildMetadata()`; set `NEXT_PUBLIC_SITE_URL`
