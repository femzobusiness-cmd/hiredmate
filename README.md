# HiredMate

AI-powered interview prep for nurses and healthcare professionals.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS**
- **Supabase** (auth + database)
- **Claude API** (AI features)
- **Stripe** (payments)
- **Resend** (emails)
- **Vercel** (deployment)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Enable Google OAuth under Authentication → Providers
4. Add redirect URL: `http://localhost:3000/auth/callback`

### 3. Environment variables

Copy `.env.local` and fill in your keys:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. Add Stripe webhook endpoint: `https://your-domain.com/api/webhook`

## Project Structure

```
app/
  (auth)/          # Login & signup
  (app)/           # Protected routes
    onboarding/    # 4-step onboarding flow
    (main)/        # Dashboard, practice, sessions
  api/             # API routes
components/        # UI & feature components
lib/               # Supabase, Stripe, Anthropic clients
```
