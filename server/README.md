# Portfolio API

Express API for the portfolio: public content, admin auth, image uploads and the contact form.
Data lives in PostgreSQL (Neon in production) and is accessed through Prisma.

## Setup

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # fill in DATABASE_URL / DIRECT_URL and the rest
npm run db:deploy           # apply migrations
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=... npm run db:seed
npm run dev                 # http://localhost:3001
```

### Neon

Create a project at neon.tech, then copy two connection strings from **Connect**:

- `DATABASE_URL` — the **pooled** string (host contains `-pooler`). Used by the app at runtime.
- `DIRECT_URL` — the direct string. Used by Prisma Migrate.

### Local database without Neon

```bash
npx prisma dev -d -n portfolio-local   # prints a postgres://… URL ending in /template1
```

Create a `portfolio` database on that server and point `DATABASE_URL` at `/portfolio` rather than
`/template1` — Postgres clones `template1` for every new database, including Prisma's shadow database.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the API with file watching |
| `npm run db:migrate` | Create and apply a migration after editing `prisma/schema.prisma` |
| `npm run db:deploy` | Apply pending migrations (use in CI / production) |
| `npm run db:seed` | Load `prisma/seed-data.json` into empty tables; add `-- --reset` to replace content |
| `npm run db:studio` | Browse the database in Prisma Studio |

## API

Public:

- `GET /health`
- `GET /api/content/hero`
- `GET /api/content/projects` · `GET /api/content/projects/:slug`
- `GET /api/content/experience`
- `GET /api/content/skills`
- `POST /api/contact` — `{ name, email, message, recaptchaToken? }`

Admin (Bearer token from `POST /api/auth/login`):

- `PUT /api/content/hero` (partial updates allowed)
- `POST | PUT /:id | DELETE /:id` on `/api/content/projects`, `/experience`, `/skills`
- `POST /api/upload` — multipart `image`, uploads to Cloudinary
