# Retail Dashboard

Connects directly to Snowflake from Vercel serverless functions - no EC2, no tunnel needed.

## Local setup
1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in real values
3. `npm run dev`

## Deploy to Vercel
1. Push this folder to a GitHub repo
2. Import the repo in Vercel (vercel.com/new)
3. In Vercel's project settings > Environment Variables, add the same 5 SNOWFLAKE_* values from .env.local.example
4. Deploy

Charts auto-refresh every 30 seconds by polling the API routes.
