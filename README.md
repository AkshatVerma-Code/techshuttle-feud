# Tech Shuttle Feud — Next.js + Supabase

A two-screen Family-Feud-style game for Tech Shuttle.

## Routes
- `/admin` — host/controller laptop
- `/display` — Smartboard/projector PC

The two computers are independent. They communicate through Supabase Realtime over the internet.

## 1. Create Supabase
1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase-schema.sql`.
3. Open **Project Settings → API**.
4. Copy the Project URL and anon/publishable key.

Create `.env.local`:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 2. Local test

```bash
npm install
npm run dev
```

Open:
```text
http://localhost:3000/admin
http://localhost:3000/display
```

## 3. Vercel deployment
Import this repository into Vercel.
Add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then deploy.

Use:
```text
https://YOUR-APP.vercel.app/admin
https://YOUR-APP.vercel.app/display
```

## Game behavior
- Admin chooses a question.
- Clicking an answer broadcasts a reveal event through Supabase Realtime.
- Display flips that answer card.
- Strike broadcasts a strike state.
- Questions and popularity are stored in Supabase Postgres.
- Admin editor is below Live Control and full-width.
- Desktop question picker uses 4 columns.

## Security
The SQL demo policies allow public writes. That is convenient for a college-event prototype but is NOT appropriate for a public production app. Add Supabase Auth and restricted RLS policies before exposing sensitive/private data.
