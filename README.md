# Yokva Landing

Single-page React + TypeScript + Tailwind landing for Yokva: an AI pipeline that transforms weak apartment photos into platform-ready rental creatives.

## Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- Lucide React

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Project structure

- `src/components` UI sections/layout
- `src/content/translations.ts` all visible copy
- `src/types/landing.ts` typed content contracts
- `src/hooks/useReveal.ts` IntersectionObserver reveal hook
- `src/lib/waitlistApi.ts` frontend waitlist API client
- `vite.config.ts` local waitlist API middleware (`/api/waitlist`)

## Local waitlist storage

During local dev/preview, emails are written to:

- `data/waitlist-emails.txt`

The file is ignored by git (`.gitignore`) and not committed.

## Cloudflare Pages waitlist (production)

Production uses Pages Functions with D1:

- Function: `functions/api/waitlist.ts`
- SQL schema: `migrations/0001_waitlist.sql`

In Cloudflare Pages, add a D1 binding named `WAITLIST_DB`.
