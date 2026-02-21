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
- `src/lib/analytics.ts` PostHog init + capture helpers
- `vite.config.ts` local waitlist API middleware (`/api/waitlist`)

## PostHog analytics

Set frontend variables in Cloudflare Pages (`Settings -> Variables and secrets`):

- `VITE_PUBLIC_POSTHOG_KEY`
- `VITE_PUBLIC_POSTHOG_HOST` (`/ph` when reverse proxy is enabled)
- Optional: `VITE_PUBLIC_POSTHOG_UI_HOST`

Set backend/runtime variable for Pages Function proxy:

- `POSTHOG_PROXY_HOST` (`https://us.i.posthog.com` or `https://eu.i.posthog.com`)

Reverse proxy endpoint in this repo:

- `functions/ph/[[path]].ts` -> proxies `/ph/*` to PostHog ingest host

Events tracked in code:

- `hero_cta_clicked`
- `navbar_waitlist_clicked`
- `demo_transform_started`
- `demo_transform_completed`
- `demo_preset_selected`
- `slider_interacted`
- `pricing_cta_clicked`
- `waitlist_submit_attempt`
- `waitlist_submit_failed`
- `waitlist_joined`

## Local waitlist storage

During local dev/preview, emails are written to:

- `data/waitlist-emails.txt`

The file is ignored by git (`.gitignore`) and not committed.

## Cloudflare Pages waitlist (production)

Production uses Pages Functions with D1:

- Function: `functions/api/waitlist.ts`
- SQL schema: `migrations/0001_waitlist.sql`

In Cloudflare Pages, configure:

- D1 binding named `WAITLIST_DB`
- Environment variable `TURNSTILE_SECRET_KEY` (Turnstile secret key)
- Frontend variable `VITE_TURNSTILE_SITE_KEY` (Turnstile site key)
- Secret `RESEND_API_KEY` (Resend API key for outgoing emails)
- Optional env `RESEND_FROM` (default: `Roman from Yokva <ceo@yokva.com>`)
- Optional env `RESEND_REPLY_TO` (default: `ceo@yokva.com`)

### Resend setup (email after waitlist submit)

1. In Resend:
- Verify your sending domain (you already connected it).
- Create an API key with sending permissions.
- Keep the key private.

2. In Cloudflare Pages project:
- Go to `Settings -> Variables and secrets`.
- Add `RESEND_API_KEY` as a **Secret** (Production and Preview if needed).
- Optionally add `RESEND_FROM` and `RESEND_REPLY_TO`.
- Save and trigger a redeploy.

3. Runtime behavior:
- New email submit -> email is inserted into D1 (`waitlist_emails`).
- If inserted successfully, Pages Function calls Resend API.
- If Resend fails, submit still succeeds (email stays saved in D1), and error is logged.

### Important local note

`npm run dev` uses `vite.config.ts` local middleware (`data/waitlist-emails.txt`) and does not send Resend emails.  
Resend sending is active in Cloudflare Pages Function (`functions/api/waitlist.ts`) in production.
