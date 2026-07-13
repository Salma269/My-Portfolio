# My-Portfolio

Bilingual (English/Arabic), theme-aware portfolio for **Salma Mohamed Sayed**.

## Stack

- Vite + React + TypeScript
- React Router, react-i18next, CSS variables for light/dark themes
- Three.js hero background via `@react-three/fiber` with reduced-motion/WebGL/mobile fallbacks
- Vercel Serverless Functions in `/api`
- MongoDB Atlas CMS collections seeded from the CV
- Vercel Blob media upload API with Sharp optimization
- Gmail SMTP contact API with honeypot and rate limiting

## Local setup

```bash
bun install
cp .env.example .env
bun run seed
bun dev
```

`.env` is intentionally gitignored. Add production secrets in Vercel Project Settings only.

## Admin bootstrap

Generate a bcrypt hash for the admin password:

```bash
bun run hash:password -- "your-strong-admin-password"
```

Set `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` in `.env` and Vercel, then run:

```bash
bun run seed
```

## Scripts

```bash
bun dev             # Local Vite SPA + Vercel-compatible API dev server
bun run build       # TypeScript + production build
bun run preview     # Preview dist/
bun run typecheck   # TypeScript check
bun run seed        # Idempotent MongoDB seed from CV content
bun run test:e2e    # Playwright UI/API/admin smoke tests
```

## UX validation

Run the app from the repository root with:

```bash
bun dev
```

Then validate responsive UI, theme transitions, RTL, API content, and admin login with:

```bash
bun run test:e2e
```

## Public CV route

The CV is served at `/cv` and redirects to the bundled `public/cv.pdf`; the footer uses this route for the download button. Admin remains accessible only by URL at `/admin`.

## Deployment notes

- Vercel build command: `npm run build`
- Output directory: `dist`
- Serverless API routes: `/api/*`
- Production domain target: `salma-mohamed.com`
