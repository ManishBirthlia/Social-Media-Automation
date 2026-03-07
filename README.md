# ⚡ ClipFlow — AI Social Media Automation Platform

> Upload a video once. AI writes the content. Publish to every platform on your schedule.

ClipFlow is a personal-use, production-ready web application that takes a video (uploaded directly or pulled from YouTube), generates platform-optimized titles, captions, hashtags, and descriptions using AI, then lets you review, schedule, and publish to YouTube Shorts, Instagram Reels, TikTok, Facebook, and X (Twitter) — all from one dashboard.

---

## ✨ Features

- **Single video → 5 platforms** — Upload once, AI generates tailored content for every platform simultaneously
- **YouTube URL ingestion** — Paste a YouTube link and ClipFlow downloads and processes it automatically
- **AI transcription** — OpenAI Whisper converts your video audio to text, which feeds the content generator
- **GPT-4 content generation** — Platform-aware prompts produce character-limit-respecting captions, hashtags, titles, and descriptions
- **Inline content editor** — Edit any generated caption or hashtag before publishing without losing the AI draft
- **Per-platform scheduling** — Set different publish times for each platform independently (e.g. YouTube now, TikTok tomorrow 9am, Instagram Friday 6pm)
- **Automated cron publisher** — Vercel Cron fires every minute and publishes any due scheduled posts automatically
- **Publish history & logs** — Full audit trail of every post attempt with status, platform, and post ID
- **Single admin auth** — Secure credential-based login, protected routes, JWT sessions

---

## 🖥️ Pages & UI

| Route | Description |
|-------|-------------|
| `/` | Landing page with app overview and login/register options |
| `/login` | Split-screen admin login with branding panel and demo credentials |
| `/dashboard` | Stats overview, recent videos, live activity feed |
| `/upload` | Drag-and-drop file upload or YouTube URL input with niche/tone settings |
| `/videos` | Video grid with thumbnails, platform badges, and status indicators |
| `/videos/[id]` | Per-platform content editor — view, edit, regenerate, publish now, or schedule |
| `/schedule` | All pending scheduled jobs with times and cancel actions |
| `/history` | Complete publish log table across all platforms |
| `/settings` | Platform OAuth connection management and AI API key configuration |

---

## 🗂️ Project Structure

```
clipflow/
├── prisma/
│   └── schema.prisma          # Database schema (6 models)
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── (dashboard)/       # All authenticated pages + shared layout
│   │   └── api/               # All API routes
│   │       ├── auth/          # NextAuth handler
│   │       ├── video/         # Upload + ingest-url + get/delete
│   │       ├── generate/      # AI content generation
│   │       ├── content/       # Edit generated content
│   │       ├── schedule/      # Create scheduled jobs
│   │       ├── publish/now/   # Immediate publish trigger
│   │       └── cron/publish/  # Automated cron publisher
│   ├── components/
│   │   └── layout/            # Sidebar, Header, Providers
│   ├── lib/
│   │   ├── ai.ts              # Whisper + GPT-4 integration
│   │   ├── auth.ts            # NextAuth config
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── storage.ts         # Cloudflare R2 / S3 helpers
│   │   ├── utils.ts           # Date formatting, color helpers
│   │   └── platforms/         # One adapter per platform
│   │       ├── youtube.ts
│   │       ├── instagram.ts
│   │       ├── tiktok.ts
│   │       ├── facebook.ts
│   │       └── twitter.ts
│   ├── middleware.ts           # Route protection
│   └── types/index.ts         # Shared TypeScript types
├── .env.example               # All required environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json                # Cron job configuration
```
---

## 📦 PROJECT ROOT (Monorepo — single repo, simple)
│
├── 🖥️  FRONTEND
│   ├── Next.js 14 (App Router)        ← UI + API routes in one project
│   ├── TypeScript                     ← type safety, catches bugs early
│   ├── Tailwind CSS                   ← styling, no separate CSS files
│   ├── shadcn/ui                      ← pre-built components (forms, cards, dialogs)
│   └── React Query (TanStack)         ← async state, polling publish status
│
├── 🔧  BACKEND  (Next.js API Routes — no separate server needed)
│   ├── /api/video/upload              ← receives file, saves to storage
│   ├── /api/video/ingest-url          ← triggers yt-dlp download
│   ├── /api/generate                  ← calls Whisper + LLM, returns content
│   ├── /api/schedule                  ← saves scheduled job to DB
│   ├── /api/publish/[jobId]           ← manually trigger publish
│   └── /api/cron/publish              ← called by cron every minute
│
├── 🤖  AI LAYER
│   ├── OpenAI Whisper API             ← audio → transcript (pay per use, ~$0.006/min)
│   │   └── Alt: faster-whisper        ← self-hosted if you want free transcription
│   ├── Anthropic Claude / OpenAI GPT  ← transcript → platform content packages
│   └── Prompt template file           ← single versioned prompt, tweak over time
│
├── ⏰  SCHEDULING
│   ├── Vercel Cron Jobs               ← if deploying on Vercel (free, runs every min)
│   │   └── OR node-cron               ← if self-hosting (runs in same process)
│   └── jobs table in DB               ← stores: video_id, platform, scheduled_at, status
│
├── 🗄️  DATABASE
│   └── PostgreSQL via Supabase        ← free tier, enough for personal use
│       ├── users table                ← just you, but schema ready for multi-user
│       ├── videos table               ← metadata, transcript, storage path
│       ├── platform_content table     ← generated content per platform per video
│       ├── scheduled_jobs table       ← what to publish, when, to where
│       └── publish_logs table         ← success/failure history
│
├── 📁  FILE STORAGE
│   ├── Cloudflare R2                  ← S3-compatible, FREE egress (best for video)
│   │   └── Alt: AWS S3               ← more ecosystem support, small egress cost
│   └── Stored: original video, thumbnail, transcript JSON
│
├── 🔐  AUTH
│   └── NextAuth.js                    ← handles your own login + platform OAuth
│       ├── Google OAuth               ← your personal login
│       ├── YouTube OAuth              ← upload permission
│       ├── Meta OAuth                 ← Instagram + Facebook
│       ├── TikTok OAuth               ← TikTok upload
│       └── Twitter OAuth 2.0          ← X upload
│
├── 📡  SOCIAL PLATFORM SDKs / APIs
│   ├── YouTube Data API v3            ← google-auth-library + axios
│   ├── Instagram Graph API            ← Meta's official endpoints (no SDK needed)
│   ├── Facebook Graph API             ← same Meta token as Instagram
│   ├── TikTok Content Posting API     ← direct HTTP calls
│   └── Twitter API v2                 ← twitter-api-v2 npm package
│
├── 🚀  DEPLOYMENT (personal phase)
│   ├── Vercel                         ← free tier, auto-deploy on git push
│   │   ├── Hosts Next.js app
│   │   ├── Runs API routes as serverless functions
│   │   └── Built-in Cron Jobs (free)
│   └── Supabase                       ← free tier DB + storage fallback
│
└── 🛠️  DEV TOOLING
    ├── pnpm                           ← faster than npm, less disk space
    ├── ESLint + Prettier              ← code consistency
    ├── Zod                            ← runtime schema validation (LLM output, API input)
    └── dotenv                         ← local secrets management
---

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | UI + API routes in one project |
| Language | TypeScript | Type safety throughout |
| Styling | Tailwind CSS + DM Sans font | Clean, minimal design system |
| Components | shadcn/ui + Lucide icons | Pre-built accessible components |
| Auth | NextAuth.js v4 (Credentials) | Admin login + platform OAuth |
| Database | PostgreSQL + Prisma ORM | All app data and job state |
| Storage | Cloudflare R2 (S3-compatible) | Video files, thumbnails, transcripts |
| Transcription | OpenAI Whisper API | Audio → text for content generation |
| AI Generation | OpenAI GPT-4o | Platform-optimized content packages |
| Scheduling | Vercel Cron Jobs | Fires `/api/cron/publish` every minute |
| Async State | TanStack React Query | Client-side data fetching and caching |
| Validation | Zod | Runtime schema validation on all API inputs |
| Notifications | Sonner | Toast notifications |
| Deployment | Vercel + Supabase | Free tier, auto-deploy from git |

---

## 🚀 Quick Start

### 1. Unzip and install dependencies

```bash
unzip clipflow-starter.zip
cd clipflow
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in the required values (see [Environment Variables](#-environment-variables) below).

### 3. Set up the database

```bash
npm run db:push       # Creates all tables from the Prisma schema
npm run db:generate   # Generates the Prisma client
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with:

```
Email:    admin@clipflow.app
Password: admin123
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in each value:

```bash
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/clipflow"
# Use Supabase free tier: https://supabase.com → New project → Connection string

# ── NextAuth ──────────────────────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""          # Generate: openssl rand -base64 32

# ── Admin Login ───────────────────────────────────────────────────────────────
ADMIN_EMAIL="admin@clipflow.app"
ADMIN_PASSWORD="your-secure-password"
ADMIN_NAME="Your Name"

# ── AI APIs ───────────────────────────────────────────────────────────────────
OPENAI_API_KEY="sk-..."     # https://platform.openai.com/api-keys
ANTHROPIC_API_KEY="sk-ant-..."  # Optional fallback

# ── Cloudflare R2 Storage ─────────────────────────────────────────────────────
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="clipflow-videos"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"
# Guide: https://developers.cloudflare.com/r2/api/s3/tokens/

# ── Social Platform OAuth ──────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

META_APP_ID=""
META_APP_SECRET=""

TIKTOK_CLIENT_KEY=""
TIKTOK_CLIENT_SECRET=""

TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""

# ── App ────────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET=""              # Generate: openssl rand -base64 32
```

---

## 📡 Platform Setup Guide

Each platform requires you to create a developer app and obtain OAuth credentials.
**Start this process early** — Instagram, TikTok, and YouTube all require a formal app review (4–8 weeks) before publish scopes work with real accounts.

### YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable **YouTube Data API v3**
3. Create OAuth 2.0 credentials → Add `http://localhost:3000/api/auth/callback/google` as redirect URI
4. Request the `https://www.googleapis.com/auth/youtube.upload` scope
5. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env.local`

### Instagram & Facebook
1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app → Add **Instagram Graph API** and **Facebook Login** products
3. Request `instagram_content_publish` and `pages_manage_posts` permissions
4. Add `META_APP_ID` and `META_APP_SECRET` to `.env.local`
5. ⚠️ App review required before these scopes work in production

### TikTok
1. Go to [TikTok for Developers](https://developers.tiktok.com)
2. Create an app → Add **Content Posting API**
3. Add `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` to `.env.local`
4. ⚠️ Requires app review and must include disclosure text in all captions

### X (Twitter)
1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create a project + app → Enable OAuth 2.0
3. Add `http://localhost:3000/api/auth/callback/twitter` as callback URL
4. Request `tweet.write` and `media.write` scopes (Basic tier or higher)
5. Add `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` to `.env.local`

---

## 🗄️ Database Schema

```
Video
  id, title, description, storagePath, thumbnailPath,
  transcript, duration, sourceUrl, niche, tone, status, createdAt

PlatformContent
  id, videoId, platform, title, caption,
  hashtags[], description, createdAt

ScheduledJob
  id, videoId, platform, scheduledAt, status,
  executedAt, errorMsg, retryCount, createdAt

PublishLog
  id, videoId, platform, status,
  platformPostId, errorMsg, publishedAt

OAuthToken
  id, platform, accessToken, refreshToken,
  expiresAt, scope, accountId, accountName
```

---

## ⏰ How Scheduling Works

1. User clicks **Schedule** on a video's platform content page
2. User picks a date and time using the datetime picker
3. A `ScheduledJob` row is created in the database with `status: PENDING`
4. Vercel Cron calls `GET /api/cron/publish` every minute (configured in `vercel.json`)
5. The cron handler fetches all `PENDING` jobs where `scheduledAt <= now`
6. Each due job is dispatched to the correct platform adapter
7. On success: job status → `PUBLISHED`, a `PublishLog` entry is created
8. On failure: job status → `FAILED`, error is logged, visible in `/history`

---

## 🚢 Deploying to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
gh repo create clipflow --public --push

# 2. Import project on Vercel
# Visit https://vercel.com/new → Import your repo

# 3. Add all environment variables in Vercel dashboard
# Project → Settings → Environment Variables

# 4. Deploy
git push origin main   # Vercel auto-deploys on every push
```

The `vercel.json` file already configures the cron job:
```json
{
  "crons": [{ "path": "/api/cron/publish", "schedule": "* * * * *" }]
}
```

---

## 📅 Suggested Build Order

```
Week 1 — Core pipeline
  ✓ Video upload working end-to-end
  ✓ Whisper transcription running
  ✓ GPT-4 content generation displaying in UI

Week 2 — Publishing
  ✓ OAuth connected for at least one platform
  ✓ Manual "Publish Now" working for that platform
  ✓ Publish log recording results

Week 3 — Scheduling + remaining platforms
  ✓ Scheduling UI functional
  ✓ Cron publisher running on Vercel
  ✓ All 5 platform adapters connected

Week 4 — Polish
  ✓ Inline content editing smooth
  ✓ Per-platform regenerate working
  ✓ Error states visible in history
  ✓ YouTube URL ingest (yt-dlp) integrated
```

---

## 🔮 Personal → Public Migration Path

The schema is multi-user ready (`user_id` on all tables). When you decide to open it up:

| What to Add | Effort | Notes |
|-------------|--------|-------|
| Stripe billing | Medium | Add `plan` field to users, gate features by plan |
| Redis + BullMQ | Medium | Replace cron with proper job queues for >10 users |
| Separate backend | Medium | Extract API routes to a standalone FastAPI service |
| Per-user OAuth apps | High | Each user brings their own developer app credentials |
| Rate limiting | Low | Add per-user publish quotas to the scheduled_jobs logic |
| Multi-workspace | Medium | Add a `workspaces` table for agency use cases |

---

## ⚠️ Important Notes

- **Token security** — OAuth tokens are stored in the database. In production, encrypt them using `node:crypto` AES-256-GCM before storing. Add a `TOKEN_ENCRYPTION_KEY` to your environment variables.
- **Platform rate limits** — Each platform enforces daily upload limits. Instagram allows ~50 uploads/day per account; X allows 5 videos/day on the Basic tier. The platform adapters respect these but do not currently enforce them proactively.
- **TikTok disclosure** — TikTok's Content Posting API requires all automated posts to include a disclosure. The TikTok adapter automatically appends `#ad` — update this to meet your specific compliance requirement.
- **Vercel function timeout** — Serverless functions on Vercel have a 10-second timeout on the free plan. Video uploads and AI generation can exceed this. Use the Pro plan (60s timeout) or consider chunked uploads for files larger than 100MB.

---

## 📄 License

This project is for personal use. Adapt freely for your own purposes.

---

<div align="center">
  Built with Next.js · Powered by OpenAI · Deployed on Vercel
</div>