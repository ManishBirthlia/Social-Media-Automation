# ClipFlow — AI Social Media Automation

Upload a video → AI generates platform-optimized content → Schedule & publish to 5 social platforms.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in values
cp .env.example .env.local

# 3. Set up database
npm run db:push

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with:
- **Email:** admin@clipflow.app  
- **Password:** admin123

## Platforms Supported

| Platform | Upload | Schedule |
|----------|--------|----------|
| YouTube Shorts | ✅ | ✅ |
| Instagram Reels | ✅ | ✅ |
| TikTok | ✅ | ✅ |
| Facebook Reels | ✅ | ✅ |
| X (Twitter) | ✅ | ✅ |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth.js v4
- **Database:** PostgreSQL + Prisma
- **Storage:** Cloudflare R2 (S3-compatible)
- **AI:** OpenAI Whisper + GPT-4 / Anthropic Claude
- **Styling:** Tailwind CSS
- **Deployment:** Vercel + Supabase

## Project Structure

```
src/
  app/           # Next.js App Router pages
  components/    # Reusable UI components
  lib/           # Core business logic
  types/         # TypeScript types
prisma/
  schema.prisma  # Database schema
```
