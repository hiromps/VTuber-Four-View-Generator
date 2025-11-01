# VTuber Four-View Generator

AI-powered VTuber character sheet and concept art generator with token-based monetization.

## Features

- **Character Sheet Generator**: Upload a front-view image and generate 4-view character sheets (front, back, left, right)
- **Concept Art Generator**: Generate VTuber character concepts from text prompts
- **Token System**: Pay-per-use model with initial 5 free tokens
- **Magic Link Authentication**: Passwordless email authentication via Supabase
- **Stripe Integration**: Secure token purchases

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links)
- **Payment**: Stripe
- **AI**: Google Gemini 2.5 Flash + Imagen 4.0

## Token Pricing

**Free Tier:**
- 5 free tokens on signup

**Token Usage:**
- Character Sheet (4 views): 4 tokens
- Concept Art (1 image): 1 token

**Purchase Options:**
- 10 tokens: $4.99 ($0.50/token)
- 30 tokens: $11.99 ($0.40/token) - Most Popular
- 100 tokens: $29.99 ($0.30/token)

## Setup Instructions

### Prerequisites

- Node.js 18+
- A Supabase account
- A Stripe account
- A Google Gemini API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable and secret keys from the Dashboard
3. Set up a webhook endpoint pointing to `your-domain.com/api/stripe/webhook`
4. Add the `checkout.session.completed` event to your webhook
5. Copy the webhook signing secret

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Gemini API
API_KEY=your_gemini_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Testing Stripe Webhooks Locally

Use the Stripe CLI to forward webhooks to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables
4. Deploy

### Stripe Webhook Configuration

After deployment, update your Stripe webhook endpoint to point to:
```
https://your-domain.com/api/stripe/webhook
```

## Database Schema

### Users Table
```sql
- id (UUID, primary key)
- email (text, unique)
- tokens (integer, default: 5)
- created_at, updated_at (timestamps)
```

### Transactions Table
```sql
- id (UUID, primary key)
- user_id (UUID, foreign key)
- type (enum: free_signup, purchase, generation_sheet, generation_concept)
- amount (integer)
- balance_after (integer)
- stripe_session_id (text, nullable)
- created_at (timestamp)
```

## API Routes

- `POST /api/auth/login` - Send magic link
- `POST /api/auth/logout` - Logout user
- `GET /api/tokens` - Get user token balance
- `POST /api/generate/sheet` - Generate character sheet
- `POST /api/generate/concept` - Generate concept art
- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## License

MIT
