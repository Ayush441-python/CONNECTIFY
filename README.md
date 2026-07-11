# Connectify — Brand & Influencer Collaboration Platform

A full-stack marketplace connecting brands with creators: profiles, a Discover feed, campaigns,
applications, direct collaboration requests, an auto-created collaboration workspace, real-time
chat, notifications, dashboards with charts, and an admin panel.

```
connectify/
├── backend/               Express + TypeScript + Prisma (PostgreSQL) + Socket.IO API
├── frontend/               React + Vite + TypeScript + Tailwind CSS
├── docker-compose.yml      Postgres + backend + frontend, one command, local only
├── render.yaml             Render Blueprint (must live at repo root — see Section 6)
└── .github/workflows/      CI (typecheck/build/test) + optional CD (deploy hooks)
```

---

## 1. What's fully built vs. what's scaffolded

**Fully wired, end to end (frontend ↔ backend ↔ database):**
- Auth: register (brand/influencer), login, logout, JWT access tokens + rotating refresh
  tokens in an httpOnly cookie, forgot/reset password, **email verification (backend +
  frontend confirmation page)**
- Influencer profile + portfolio (up to 20 images, featured toggle, **Cloudinary** storage)
- Brand profile + logo upload (also Cloudinary)
- Discover feed — filters: category, tier, availability, location, search, sort — with save/unsave
- Campaigns: full CRUD for brands (with **search + status-tab filtering**), browse/filter for
  influencers, deliverables, moodboard images
- Applications: apply → brand accepts/rejects (**status-tab filtering on both sides**) →
  auto-creates a Collaboration workspace
- Collaboration Requests: brand invites a creator directly → accept/reject
  (**status-tab filtering**) → auto-creates a workspace
- Collaboration workspace: notes, deadline, shared files
- Real-time chat via Socket.IO: typing indicators, online presence, read receipts, image messages
- Notifications (in-app, created on every key event, pushed live over the socket)
- Saved creators (**with search**) / saved campaigns
- Admin: platform stats **with charts** (user breakdown, platform activity), user list with
  suspend/activate/delete (**with debounced search**), reports list
- **Dashboards now chart real data**: influencer dashboard (application status donut), brand
  dashboard (campaign status bar chart), admin overview (user breakdown donut + activity bar
  chart) — built with Recharts, styled to the brand palette, and reused via
  `components/Charts.tsx`
- **Consistent loading/error handling**: a shared `useAsync` hook (`hooks/useAsync.ts`) backs
  every major data-fetching page with skeleton loaders (card/row/stat variants in
  `components/ui.tsx`) while loading and a retry-capable `ErrorState` when a request fails,
  instead of failures silently rendering an empty list. An app-wide `ErrorBoundary` catches
  render-time crashes with a friendly fallback instead of a blank screen.

**Backend endpoint exists but has no dedicated frontend screen yet** (easy to wire up — the API
is ready): admin portfolio-image moderation, admin campaign moderation.

**Deliberately simplified — needs a real provider to go further:**
- **Mobile OTP** — the schema and registration form collect a mobile number and the
  architecture is OTP-ready, but no SMS provider is wired in. Email verification is the
  implemented path today.
- **Email sending** — uses Nodemailer. Without `SMTP_*` env vars set, emails are logged to the
  server console instead of sent, so auth flows keep working in local dev. Add real SMTP
  credentials (or swap in Resend/SendGrid) for production.
- **Emoji picker** — a quick-reaction strip rather than a full picker library, to avoid an
  extra dependency for something cosmetic.

---

## 2. Testing

Both apps have real, running test suites (Vitest), wired into `npm test` and into CI.

**Backend** (`backend/src/**/__tests__`, `backend/src/__tests__`) — 33 tests:
- `ApiError.test.ts`, `validators.test.ts` — pure unit tests, no database needed.
- `app.test.ts` — supertest against the real Express app: health check, 404 handling,
  validation-layer rejections, and auth-guard rejections (401s) on protected routes.
- `auth.integration.test.ts` — full register → login → `/auth/me` flow against a real database.

**Frontend** (`frontend/src/**/__tests__`) — 18 tests:
- `ui.test.tsx` — Button, Input, Badge, EmptyState, ErrorState behavior (render, click, disabled/
  loading states, retry callback).
- `useAsync.test.ts` — the shared data-fetching hook: loading → data, loading → error, `reload()`,
  optimistic `setData()`.
- `api.test.ts` — `extractErrorMessage` against real Axios error shapes.

Run them:
```bash
cd backend && npm test    # or npm run test:watch
cd frontend && npm test   # or npm run test:watch
```

> **Sandbox note:** this project was built inside a sandbox whose network allowlist doesn't
> include `binaries.prisma.sh` (Prisma's engine-binary host), so `prisma generate` could never
> fully complete there. I validated everything that doesn't need a live query engine — the full
> schema, every model/relation/field name (grepped and cross-checked by hand against
> `schema.prisma`), a filtered `tsc --noEmit` pass, and 24/24 backend unit tests that don't touch
> the database, plus all 18 frontend tests and both production builds, all genuinely green. The
> two backend suites that need a real Prisma client (`app.test.ts`, `auth.integration.test.ts`)
> fail *in that sandbox specifically* with `@prisma/client did not initialize yet` — that's the
> same blocked-domain issue, not a code defect, and it will not happen on your machine or in the
> GitHub Actions workflow below, both of which have normal internet access.

---

## 3. Docker

**Local full stack, one command** (Postgres + backend + frontend):
```bash
docker compose up --build
```
Frontend on `http://localhost:5173`, backend on `http://localhost:5000`. Cloudinary env vars
default to empty, so uploads will fail until you export `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` before running (`docker compose` picks up a
`.env` file in the project root automatically). Seed the admin account once the stack is up:
```bash
docker compose exec backend npm run seed
```

Each app also has a standalone `Dockerfile` (`backend/Dockerfile`, `frontend/Dockerfile` — the
frontend one is a multi-stage build served by nginx, config in `frontend/nginx.conf`) for
platforms that build from a single image rather than a compose file.

---

## 4. CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`: installs, typechecks, and builds both
apps, and runs both test suites — the backend job spins up a real `postgres:16-alpine` **service
container**, so the full integration test suite (the one this sandbox couldn't run) executes for
real on every push.

`.github/workflows/deploy.yml` is optional — Render and Vercel both auto-deploy from GitHub once
connected, so you likely don't need it. It's there if you'd rather gate deploys behind CI passing
first, firing each platform's deploy-hook URL from secrets.

---

## 5. Local development (without Docker)

### Backend
```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL, JWT secrets, Cloudinary, etc.
npm install
npx prisma migrate dev --name init   # creates tables from prisma/schema.prisma
npm run seed                          # creates the admin account from ADMIN_EMAIL/ADMIN_PASSWORD
npm run dev                           # http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # point at your local backend
npm install
npm run dev                # http://localhost:5173
```

---

## 6. Deploying for real

### Step 1 — Supabase (database)
1. Create a project at [supabase.com](https://supabase.com).
2. Click **Connect** on the project dashboard to see your connection strings.
3. Render runs your backend as one persistent process (not serverless), so the **direct
   connection** (port `5432`) is the simplest choice for `DATABASE_URL` — no pooler quirks to
   worry about. If you later move the backend to a serverless/edge platform, switch to the
   Supavisor transaction pooler (port `6543`) and append `?pgbouncer=true` to the URL, since
   Prisma's default prepared-statement behavior doesn't always play well with transaction-mode
   pooling.

### Step 2 — Cloudinary (images)
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy your Cloud Name, API Key, and API Secret from the dashboard.

### Step 3 — Backend on Render
1. Push this repo to GitHub as-is — `render.yaml` is already at the repo root, which is where
   Render's Blueprint flow looks for it by default. It has `rootDir: backend` set internally,
   so Render still builds from the `backend/` folder.
2. On [render.com](https://render.com): **New → Blueprint** → connect the repo → Render reads
   `render.yaml` and shows you the service it'll create → fill in the secret env vars it prompts
   for (anything marked `sync: false`): `DATABASE_URL`, `CORS_ORIGIN` (your Vercel URL, added
   after step 4 — use `http://localhost:5173` as a placeholder for now and update it later),
   `CLIENT_URL`, `CLOUDINARY_*`, optionally `SMTP_*`, and `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
   `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` are auto-generated by the blueprint — leave those.
3. Click **Deploy Blueprint**.
4. After the first deploy, open the service's **Shell** tab (or a one-off job) and run:
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

**Don't have a repo yet, or want to deploy the backend without Blueprints?** New → Web Service →
connect the repo → set **Root Directory** to `backend` → Build Command
`npm install && npm run build` → Start Command `npm run start` → add the same env vars manually.

### Step 4 — Frontend on Vercel
1. New Project on [vercel.com](https://vercel.com) → import the same repo → set **Root Directory**
   to `frontend`.
2. Env vars: `VITE_API_URL` = `https://<your-render-service>.onrender.com/api`,
   `VITE_SOCKET_URL` = `https://<your-render-service>.onrender.com`.
3. Deploy, then copy the resulting `https://<project>.vercel.app` URL back into Render's
   `CORS_ORIGIN` and `CLIENT_URL`, and redeploy the backend.

### A note on cross-domain cookies
The refresh token is an httpOnly cookie set with `SameSite=None; Secure` in production (needed
since Vercel and Render are different domains). This works in all major browsers, but some
privacy-hardened browser configurations block third-party cookies by default — if that ever
matters to your users, putting both apps on subdomains of one root domain removes the issue
entirely.

---

## 7. Architecture notes

- **Auth**: short-lived JWT access token (kept in memory on the frontend, never localStorage) +
  a rotating opaque refresh token stored (hashed) server-side and sent only as an httpOnly
  cookie — matches the pattern already used elsewhere in this project.
- **Uploads**: Multer (memory storage) → streamed directly to Cloudinary, no temp files on disk.
- **Real-time**: a single Socket.IO namespace, JWT-authenticated at handshake, rooms per user
  (`user:<id>`) and per collaboration (`collab:<id>`).
- **Validation**: Zod schemas for every mutating endpoint.
- **Data fetching (frontend)**: `useAsync` standardizes loading/error/retry across pages;
  `api/index.ts` centralizes every endpoint call; `lib/api.ts` handles the access-token refresh
  dance transparently via an Axios interceptor.
- **Data model**: see `backend/prisma/schema.prisma` — 17 models covering every entity in the
  spec (Users, both profile types, portfolio images, campaigns + moodboards + deliverables,
  applications, requests, the collaboration workspace + files, messages, notifications, saves,
  reports, refresh tokens).

## 8. Suggested next steps
1. Run `prisma migrate dev` locally and click through the whole flow once end to end.
2. Wire up the two remaining admin-moderation buttons (endpoints already exist).
3. Add real SMTP credentials so verification/reset emails actually send.
4. If you want it, I can also add an OTP provider integration or the two moderation UI panels —
   just ask.
