# SocialSleeping

AI-powered gym recovery tracking. Log your sleep and soreness every morning, get a readiness score, share your recovery card.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** — auth, database, RLS
- **Claude API** (Haiku) — one-sentence coaching insight
- **Tailwind CSS** — dark theme UI
- **html2canvas** — download recovery card as image

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of [`supabase/schema.sql`](supabase/schema.sql)
3. Copy your project URL and anon key from **Settings → API**

### 2. Anthropic API

1. Get your API key at [console.anthropic.com](https://console.anthropic.com)

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npx vercel
```

Add the three env vars in the Vercel dashboard under **Settings → Environment Variables**.

## Readiness Score Formula

```
sleep_score    = min(sleep_hours / 8, 1) × (sleep_quality / 10)
soreness_score = 1 − (avg_soreness / 10)
rest_score     = min(rest_days / 2, 1)

readiness = round((sleep_score × 0.4 + soreness_score × 0.35 + rest_score × 0.25) × 100)
```

Claude Haiku then adds a single sentence of plain-English coaching advice based on the limiting factor.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/signup` `/login` | Auth |
| `/dashboard` | Today's readiness + 14-day history |
| `/checkin` | Daily check-in form |
| `/card/[id]` | Shareable recovery card (downloadable as PNG) |
| `/feed` | Public community feed |
