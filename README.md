# Cafe Connect

A campus cafeteria app. Students order ahead and follow their order live. Staff run the kitchen queue and manage the menu.

- **Next.js** shows the pages and runs the server code.
- **Prisma** reads and writes the app's data.
- **Supabase** hosts the database and handles logins and live updates.

## Where things are

| Folder or file | What it does |
| --- | --- |
| `app/` | One folder per page, for example `app/menu/page.tsx` |
| `app/actions.ts` | Everything that changes data, like placing an order |
| `lib/data.ts` | Everything that reads data |
| `lib/session.ts` | Finds out who is logged in |
| `lib/site-info.ts` | Cafeteria contact details and hours for the footer |
| `components/` | Reusable pieces of the screen |
| `prisma/schema.prisma` | Describes the database tables to Prisma |
| `prisma/database/migrations/` | The SQL that creates the tables |

## Set it up

1. Use Node.js 22.18 or newer, then run `npm install`.
2. Copy `.env.example` to `.env.local` and fill it in. The comments say where to find each value.
3. In the Supabase SQL editor, run the files in `prisma/database/migrations` in name order. Skip any you have already run.
4. In Supabase, open **Authentication > URL Configuration** and add `http://localhost:3000/auth/callback` to the redirect URLs.
5. Run `npm run dev` and open http://localhost:3000.

If the first migration is already applied and `DATABASE_URL` is set, `npm run db:apply` runs the newest one for you.

## Make yourself staff

Everyone who registers is a student. Register, then run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

Staff sign in at `/admin-login`.

## Change the database

1. Add a new SQL file to `prisma/database/migrations` and run it.
2. Update `prisma/schema.prisma` to match.
3. Run `npx prisma generate`.

Do not run `prisma migrate` or `prisma db push`. They would delete the Supabase login rules, which Prisma cannot see.

## One rule to remember

Prisma can read and change everything in the database. Every page and action must check who is asking first, with `requireStudent()` or `requireAdmin()`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the app |
| `npm run build` | Build for production |
| `npm test` | Run the tests |
| `npm run typecheck` | Check the types |
