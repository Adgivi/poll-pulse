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

Defined in `prisma/schema.prisma`:

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

Use `.env.example` as base.

Required:

- `DATABASE_URL`

Local example:

```env
DATABASE_URL="postgresql://pollpulse:pollpulse@localhost:5432/pollpulse"
```

For managed databases (Neon, Supabase, Prisma Postgres, etc.) you may need SSL params in the URL.

## Prerequisites

- Node.js 20+ (recommended: latest LTS)
- pnpm 10+ (via Corepack recommended)
- Docker + Docker Compose plugin (`docker compose`)
- Install Docker: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)

Enable Corepack and pnpm (if needed):

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version
```

Check Docker before local setup:

```bash
docker --version
docker compose version
docker info
```

If `docker info` fails, start Docker Desktop (or your Docker daemon) and do not continue until it succeeds.

## Local Setup

1. Configure environment file:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d
docker compose ps
```

Optional: wait for readiness logs (`database system is ready to accept connections`):

```bash
docker compose logs -f postgres
```

3. Ensure `.env` contains a valid local connection string:

```env
DATABASE_URL="postgresql://pollpulse:pollpulse@localhost:5432/pollpulse"
```

4. Install dependencies:

```bash
pnpm install
```

5. If pnpm blocks Prisma build scripts (you'll see "Ignored build scripts" after `pnpm install`), approve and reinstall:

```bash
pnpm approve-builds
pnpm install
```

When prompted, select these packages to allow scripts:
`@prisma/client`, `@prisma/engines`, `prisma`.

6. Generate Prisma client and run migrations:

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

7. Start app:

```bash
pnpm dev
```

8. Open the app:

- `http://localhost:3000`

### Docker Compose Utility Commands

- Stop containers: `docker compose down`
- Stop and remove DB data volume: `docker compose down -v`

## Verification Checklist

- `docker compose ps` shows `postgres` running (healthy/ready).
- `pnpm dev` starts without Prisma/database errors.
- `http://localhost:3000` loads in the browser.
- You can create a poll, vote, and view results.
- `GET http://localhost:3000/api/metrics` returns `200`.

## Troubleshooting

- Docker socket/daemon error (`docker.sock`, `Cannot connect to the Docker daemon`):
  start Docker Desktop (or daemon), then retry `docker info`.
- Port `5432` already in use:
  change `ports` in `docker-compose.yml` to `"5433:5432"` and update `.env` to use port `5433`.
- Postgres container does not start or is unhealthy:
  run `docker compose logs postgres` and resolve the reported error.
- `prisma: command not found` or missing local binaries:
  run `pnpm install` first, then retry Prisma commands.
- Prisma cannot connect to database:
  verify `docker compose ps` shows postgres up and `DATABASE_URL` points to an existing database/user.
- `pnpm install` blocks Prisma build scripts:
  run `pnpm approve-builds` and then `pnpm install` again.

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
