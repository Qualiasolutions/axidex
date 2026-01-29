# Axidex

Signal intelligence platform for sales teams. Detects buying signals and delivers AI-generated outreach.

**Live:** https://axidex.vercel.app

## What It Does

Axidex monitors for buying signals across:
- Hiring announcements
- Funding events
- Company expansions
- Leadership changes
- Product launches
- Partnerships

When signals are detected, AI generates personalized outreach emails ready for your sales team.

## Stack

- **Framework:** Next.js 16 + React 19
- **Database:** Supabase
- **Styling:** Tailwind CSS 4
- **Animation:** Motion (Framer Motion)
- **Deployment:** Vercel (auto-deploy on push)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Design system (CSS variables)
│   └── dashboard/
│       ├── page.tsx          # Overview
│       ├── layout.tsx        # Dashboard shell
│       └── signals/page.tsx  # Signals list
├── components/
│   ├── ui/                   # Button, Badge, Motion primitives
│   ├── layout/               # Sidebar, Header
│   ├── dashboard/            # Stats cards
│   └── signals/              # Signal cards
├── lib/
│   ├── utils.ts              # cn(), date formatting
│   └── supabase/             # Client/server Supabase setup
└── types/
    └── index.ts              # Signal, User, Email types
```

## Design System

Premium minimalist light theme with warm orange accent:

```css
--bg-primary: #ffffff
--accent: #ea580c
--text-primary: #171717
```

Typography-focused, icon-minimal aesthetic.

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

## Deployment

Auto-deploys to Vercel on push to `main`.

Manual deploy:
```bash
vercel --prod
```
