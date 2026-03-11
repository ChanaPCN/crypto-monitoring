# 🚀 Deployment Guide

## ✅ Project Status

The Crypto Portfolio Monitor application is complete and ready to deploy! The build is successful and all features are implemented.

## Built Features

✅ **Authentication**
- Email/password signup and login
- Secure session management with Supabase Auth
- Protected dashboard routes

✅ **Portfolio Management**
- Add crypto assets with search functionality
- Edit existing assets
- Delete assets with confirmation
- Real-time price fetching from CoinGecko

✅ **Dashboard Analytics**
- Total portfolio value
- Total invested amount
- Profit/loss calculations ($ and %)
- Portfolio performance percentage
- 24-hour price change tracking
- Portfolio allocation pie chart
- Detailed asset table with all metrics

✅ **User Experience**
- Dark mode design
- Responsive layout (mobile-friendly)
- Auto-refresh prices every 30 seconds
- Manual refresh button
- Loading states and error handling

✅ **Security**
- Row Level Security (RLS) on database
- User data isolation
- Secure authentication tokens

## Quick Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Crypto Portfolio Monitor"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Click "Deploy"

3. **Done!** Your app will be live in ~2 minutes

## Alternative: Deploy to Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `.next`
3. **Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Alternative: Deploy to Railway

1. Connect your GitHub repository
2. Set environment variables
3. Railway will auto-detect Next.js and deploy

## Environment Variables Required

For production, you need:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxx...
```

Get these from your Supabase project settings → API

## Database Setup (Required Before First Use)

1. Create a Supabase project
2. Run the SQL script from `supabase/schema.sql` in SQL Editor
3. This creates:
   - `portfolio` table
   - `portfolio_history` table (for future features)
   - Row Level Security policies
   - Necessary indexes

## Testing Locally

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials
3. Run:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

## Performance Notes

### CoinGecko API Limits
- Free tier: 50 calls/minute
- The app batches all price fetches into one API call
- Auto-refresh is set to 30 seconds
- This means you can track many coins without hitting rate limits

### Optimization Tips
- The app uses Next.js caching for price data (30s cache)
- Static assets are optimized automatically
- Images use Next.js Image component (not used yet, but ready)

## Post-Deployment Checklist

- ✅ Build successful
- ⬜ Supabase database configured
- ⬜ Environment variables set
- ⬜ Application deployed
- ⬜ Test signup flow
- ⬜ Test adding an asset
- ⬜ Verify prices are fetching
- ⬜ Test on mobile device

## Monitoring

After deployment, you should monitor:

1. **Supabase Dashboard**
   - Database usage
   - Active users
   - API requests

2. **CoinGecko Usage**
   - API call count
   - Rate limit warnings

3. **Vercel Analytics** (if using Vercel)
   - Page load times
   - Error rates
   - User traffic

## Scaling Considerations

### When You Grow

**Free Tier Limits:**
- Supabase: 500MB database, unlimited API requests
- CoinGecko: 50 calls/minute
- Vercel: 100GB bandwidth

**If You Need More:**
1. Upgrade Supabase (starts at $25/month)
2. Get CoinGecko Pro API (for more call limits)
3. Implement server-side caching with Redis
4. Add database connection pooling

## Troubleshooting Production Issues

### "Supabase URL is required" error
- Check environment variables are set in production
- Redeploy after adding variables

### Prices not loading
- Check CoinGecko API status
- Verify API keys are correct
- Check browser console for CORS errors

### Authentication not working
- Verify Supabase URL is correct
- Check RLS policies are enabled
- Ensure anon key has proper permissions

## Security Best Practices

✅ **Already Implemented:**
- Environment variables for secrets
- Row Level Security on database
- HTTPS enforced by hosting platforms
- Client-side auth validation

🔒 **Additional Recommendations:**
- Enable email confirmation in Supabase
- Set up rate limiting
- Add CAPTCHA for signup (if spam becomes an issue)
- Monitor for unusual database activity

## Support & Updates

For issues or questions:
1. Check `SETUP_GUIDE.md`
2. Review Supabase documentation
3. Check Next.js documentation

## License

MIT License - Feel free to use this project however you like!

---

**You're ready to deploy! 🎉**

Choose your platform above and follow the steps. The app is production-ready!
