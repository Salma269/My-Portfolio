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
npm install
cp .env.example .env
npm run seed
npm run dev
```

`.env` is intentionally gitignored. Add production secrets in Vercel Project Settings only.

## Admin bootstrap

Generate a bcrypt hash for the admin password:

```bash
npm run hash:password -- "your-strong-admin-password"
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in `.env` and Vercel, then run:

```bash
npm run seed
```

## Scripts

```bash
npm run dev         # Vite dev server
npm run build       # TypeScript + production build
npm run preview     # Preview dist/
npm run typecheck   # TypeScript check
npm run seed        # Idempotent MongoDB seed from CV content
```

## Deployment notes

- Vercel build command: `npm run build`
- Output directory: `dist`
- Serverless API routes: `/api/*`
- Production domain target: `salma-mohamed.com`
