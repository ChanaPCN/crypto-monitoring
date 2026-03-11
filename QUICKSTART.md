# Crypto Portfolio Monitor - Quick Start

Welcome! This app helps you track your cryptocurrency investments with real-time prices.

## What You Need First

1. **Create a Supabase Account** (Free)
   - Go to https://supabase.com
   - Click "Start your project"
   - Create a new organization and project
   - Wait 2 minutes for setup

2. **Set Up Your Database**
   - In Supabase, click "SQL Editor" (left sidebar)
   - Click "New Query"
   - Copy everything from the `supabase/schema.sql` file
   - Paste and click "Run"
   - You should see "Success. No rows returned"

3. **Get Your API Keys**
   - Click "Project Settings" (gear icon at bottom left)
   - Click "API" tab
   - Copy your **Project URL** and **anon public key**

4. **Configure the App**
   - Rename `.env.example` to `.env.local`
   - Paste your Supabase URL and key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
     ```

5. **Install and Run**
   ```bash
   npm install
   npm run dev
   ```

6. **Open the App**
   - Go to http://localhost:3000
   - Click "Sign up" to create your account
   - Start adding your crypto assets!

## How to Use

1. **Add an Asset**: Click "+ Add Asset" button
2. **Search**: Type a coin like "BTC" or "ETH"
3. **Enter Details**: Amount owned, buy price, and date
4. **Track**: Watch your portfolio grow (or shrink 😅)

## Features

- ✅ Real-time prices from CoinGecko
- ✅ Automatic profit/loss calculation
- ✅ Portfolio allocation chart
- ✅ Dark mode design
- ✅ Auto-refresh every 30 seconds
- ✅ Secure authentication
- ✅ Your data is private (RLS enabled)

## Need Help?

See `SETUP_GUIDE.md` for detailed instructions and troubleshooting.

---

**That's it! Start tracking your crypto portfolio now! 🚀**
