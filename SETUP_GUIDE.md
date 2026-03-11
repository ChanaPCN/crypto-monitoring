# 🚀 Setup Guide for Crypto Portfolio Monitor

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier is fine)

## Step 1: Supabase Setup

1. Go to [https://supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the database to be provisioned (takes ~2 minutes)

### Configure Database

1. In your Supabase project, go to **SQL Editor**
2. Copy the entire contents of `supabase/schema.sql`
3. Paste it into the SQL Editor and click **Run**
4. This will create:
   - `portfolio` table
   - `portfolio_history` table
   - Row Level Security (RLS) policies
   - Necessary indexes

### Get Your Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 2: Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local` and add your Supabase credentials:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Create Your Account

1. Click "Sign up"
2. Enter your email and password
3. You'll be redirected to login
4. Sign in with your credentials

## Step 5: Start Tracking Your Portfolio

1. Click "Add Asset" button
2. Search for a cryptocurrency (e.g., "BTC", "ETH")
3. Enter the amount you own
4. Enter the buy price
5. Select the purchase date
6. Click "Add Asset"

The dashboard will automatically:
- Fetch current prices from CoinGecko
- Calculate your profit/loss
- Show portfolio allocation
- Update prices every 30 seconds

## Features

### ✅ Implemented

- 🔐 Secure authentication with Supabase
- 💼 Add, edit, and delete portfolio assets
- 📊 Real-time price tracking (CoinGecko API)
- 📈 Profit/loss calculations
- 📉 Portfolio performance percentage
- 🥧 Portfolio allocation pie chart
- 🔄 Auto-refresh prices every 30 seconds
- 🎨 Dark mode UI
- 📱 Responsive design

### 🎯 Future Enhancements

- Portfolio history tracking over time
- Price alerts
- Multi-wallet support
- Export to CSV
- Mobile app
- Advanced charts (line graphs, performance over time)
- Transaction history
- Tax reporting

## Troubleshooting

### "Failed to fetch prices"

- CoinGecko free API has rate limits
- Wait a few seconds and refresh
- Check if the coin symbol is supported

### "Not authenticated" error

- Make sure you're logged in
- Check if your Supabase credentials are correct in `.env.local`
- Verify RLS policies are enabled in Supabase

### Build errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## API Usage

### CoinGecko API

- Free tier: 50 calls/minute
- The app batches price requests
- Auto-refresh is set to 30 seconds to stay within limits

If you need higher limits, consider:
- CoinGecko Pro API
- Alternative APIs (Binance, CoinMarketCap)

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Row Level Security (RLS) ensures users can only see their own data
- Supabase handles authentication tokens securely
- All API calls are server-side or client-side with public keys only

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation
3. Check CoinGecko API status

## License

MIT
