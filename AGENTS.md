# Repository Guidelines

## Project Structure & Module Organization
- app/ Next.js App Router; localized routes under `app/[locale]/(default|admin)`, APIs in `app/api`, global styles in `app/globals.css` and theme in `app/theme.css`.
- components/ Reusable UI (shadcn in `components/ui`) and feature blocks.
- aisdk/ AI utilities and providers (e.g., `provider/`, `generate-video/`).
- lib/, services/, models/ Utilities, business logic, and data models.
- i18n/ Locale config and messages; types/ Global TypeScript types; auth/ Auth.js config; public/ static assets.
- Use path alias `@/*` (see `tsconfig.json`).

## Build, Test, and Development Commands
- pnpm install Install dependencies.
- pnpm dev Start dev server with Turbopack.
- pnpm build Production build.
- pnpm start Run built app.
- pnpm lint Next.js ESLint rules.
- pnpm analyze Bundle analyzer (sets ANALYZE=true).
- pnpm cf:preview | cf:deploy Cloudflare Pages preview/deploy.
- pnpm docker:build Build image via Dockerfile.

## Coding Style & Naming Conventions
- TypeScript strict mode; 2-space indent, semicolons, double quotes; run `pnpm lint` before PRs.
- Files kebab-case (e.g., `user-profile.tsx`); React components PascalCase; variables/functions camelCase.
- Tailwind v4 via `app/globals.css`; keep class lists readable and co-locate minimal CSS in components.
- Prefer `@/...` imports over deep relative paths.

## Testing Guidelines
- No test framework is configured. If introducing tests, prefer Vitest for unit tests and Playwright for E2E.
- Name tests `*.test.ts[x]` next to sources or in a `__tests__/` folder; add a `pnpm test` script in `package.json`.

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`, `test:`. Example: `feat(auth): add Google One Tap`.
- PRs must include: purpose/summary, screenshots for UI changes, steps to verify, linked issues.
- Ensure `pnpm lint && pnpm build` pass; avoid large mixed PRs.

## Security & Configuration Tips
- Copy envs: `cp .env.example .env.local`. Fill SUPABASE_*, AUTH_SECRET, STRIPE_*, STORAGE_*; only expose `NEXT_PUBLIC_*` in the client.
- Do not commit `.env*` or `.next/`; rotate leaked keys immediately.
- For Cloudflare, mirror required envs under `[vars]` in `wrangler.toml`.

## Agent-Specific Notes
- Place new AI providers under `aisdk/provider/` and export via `aisdk/index.ts`; read tokens from env, not code.
- For video/image generation, follow `aisdk/generate-video` patterns and keep functions pure/typed.
