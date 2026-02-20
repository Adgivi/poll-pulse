# Poll Pulse

Base project for a live poll app challenge built with Next.js, Node runtime, PostgreSQL, and Prisma.

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL database URL

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. If pnpm blocks Prisma build scripts, approve them once:

```bash
pnpm approve-builds
pnpm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

Then set `DATABASE_URL` in `.env`.

4. Validate and generate Prisma client:

```bash
pnpm prisma:validate
pnpm prisma:generate
```

5. Start the app:

```bash
pnpm dev
```

App runs at `http://localhost:3000`.

## Available Commands

- `pnpm dev` - run Next.js in development mode
- `pnpm build` - create production build
- `pnpm start` - run production server
- `pnpm lint` - run ESLint
- `pnpm prisma:validate` - validate Prisma schema
- `pnpm prisma:generate` - generate Prisma client
- `pnpm prisma:migrate` - create/apply local migration
- `pnpm prisma:studio` - open Prisma Studio

## Notes

- Prisma schema is located at `prisma/schema.prisma`.
- Generated Prisma client output is `app/generated/prisma`.
- `.env` is ignored by git; `.env.example` is committed as template.
