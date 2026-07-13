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

### Auto-deploy on push (GitHub Actions)

Pushes to `main` trigger [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which typechecks, builds, and deploys to Vercel production. Pull requests get preview deployments.

Add these GitHub repository secrets (**Settings → Secrets and variables → Actions**):

| Secret | Where to find it |
|---|---|
| `VERCEL_TOKEN` | [Vercel account tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel project **Settings → General** (Team/Account ID) |
| `VERCEL_PROJECT_ID` | Vercel project **Settings → General** (Project ID) |

One-time Vercel setup:

1. Import `https://github.com/Salma269/My-Portfolio` in [Vercel](https://vercel.com/new).
2. Add production environment variables from [`.env.example`](.env.example) in **Project Settings → Environment Variables**.
3. Copy the org and project IDs into the GitHub secrets above.
4. Point `salma-mohamed.com` to Vercel in your DNS provider.

Use **either** Vercel's built-in Git integration **or** this GitHub Action workflow, not both, to avoid duplicate deployments.

### Build settings

- Vercel build command: `npm run build`
- Output directory: `dist`
- Serverless API routes: `/api/*`
- Production domain target: `salma-mohamed.com`
