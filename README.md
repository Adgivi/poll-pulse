# Poll Pulse

Live poll app built with Next.js (App Router), Node runtime, PostgreSQL, Prisma, and Vercel.

## Stack

- Next.js 16 + React 19
- Route Handlers (REST API)
- Prisma ORM + PostgreSQL
- Tailwind CSS
- Vercel deployment

## Features (MVP + Iterative Improvements)

- Create poll with 2-5 options
- Shareable vote and results links
- Vote endpoint with one-vote-per-browser-per-poll policy
- Results page with auto-refresh (polling every 2s)
- Basic app metrics endpoint (`/api/metrics`)

## Data Model

Defined in `/Users/adolfgimeno/poll-pulse/prisma/schema.prisma`:

- `Poll`: question + slug
- `PollOption`: options per poll
- `Vote`: vote records with `@@unique([pollId, voterId])`

## API Endpoints

- `POST /api/polls` - create poll
- `GET /api/polls/[slug]` - poll detail for voting
- `POST /api/polls/[slug]/vote` - cast vote
- `GET /api/polls/[slug]/results` - aggregated results
- `GET /api/metrics` - global counters (polls/votes)

## Environment Variables

Use `/Users/adolfgimeno/poll-pulse/.env.example` as base.

Required:

- `DATABASE_URL`

Optional in local/dev workflows:

- `PRISMA_DATABASE_URL`
- `POSTGRES_URL`

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. If pnpm blocks Prisma build scripts:

```bash
pnpm approve-builds
pnpm install
```

3. Configure environment file:

```bash
cp .env.example .env
```

4. Generate Prisma client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

5. Start app:

```bash
pnpm dev
```

## Commands

- `pnpm dev` - dev server
- `pnpm build` - production build (runs `prisma generate` first)
- `pnpm start` - production server
- `pnpm lint` - lint
- `pnpm prisma:validate` - schema validation
- `pnpm prisma:generate` - generate Prisma client
- `pnpm prisma:migrate` - create/apply migration in dev
- `pnpm prisma:studio` - inspect database

## Deployment (Vercel)

1. Import GitHub repository in Vercel.
2. Connect PostgreSQL provider (Prisma Postgres/Neon).
3. Ensure `DATABASE_URL` exists in project env vars.
4. Apply migrations once:

```bash
DATABASE_URL="<connection_string>" pnpm prisma migrate deploy
```

5. Deploy.

## Architecture Notes for Interview

- Single Next.js app for frontend + API keeps scope small and explainable.
- Prisma schema captures core domain and enforces vote uniqueness at DB level.
- Polling was chosen over SSE/WebSockets to reduce infrastructure complexity.
- No auth by design; anti-duplicate strategy is cookie-based + unique DB constraint.

## Trade-offs

- Cookie-based voter identity can be bypassed across browsers/devices.
- Polling introduces read overhead but is simple and reliable for MVP scale.
- Error handling is intentionally simple for interview scope.

## Next Iteration Candidates

- Better analytics dashboard and per-poll activity metrics
- End-to-end tests for create/vote/results flow
- Optional auth / stronger anti-fraud voting rules
