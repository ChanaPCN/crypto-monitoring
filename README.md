# 📊 Crypto Portfolio Monitor

A modern, full-stack cryptocurrency portfolio tracking application built with Next.js and Supabase.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Build](https://img.shields.io/badge/build-passing-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🔐 **Secure Authentication** - Email/password login + Google OAuth
- 🔑 **Google Sign-In** - One-click login with your Google account
- 💼 **Portfolio Management** - Add, edit, and delete crypto assets
- 📊 **Real-Time Prices** - Live crypto prices from CoinGecko API
- 📈 **Profit/Loss Tracking** - Automatic calculations with percentages  
- 🥧 **Portfolio Allocation** - Beautiful pie chart visualization
- 🔄 **Auto-Refresh** - Prices update every 30 seconds
- 🎨 **Dark Mode** - Sleek, modern UI with gradient backgrounds
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Row Level Security** - Your data is private and secure

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `supabase/schema.sql`
3. Get your credentials from **Project Settings** → **API**

### 3. Local Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Start development server
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)
5. Sign up and start tracking your portfolio!

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** - Configure Google OAuth login
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## 🛠 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- Recharts

**Backend:**
- Supabase (PostgreSQL + Auth)
- Row Level Security (RLS)

**APIs:**
- CoinGecko (crypto prices)

## 📸 Screenshots

### Dashboard
- Portfolio summary with total value, profit/loss, and return percentage
- Real-time price tracking with 24h change
- Portfolio allocation pie chart
- Detailed asset table with all metrics

### Key Metrics Displayed
- Total Portfolio Value
- Total Invested
- Total Profit/Loss
- Return Percentage
- Per-Asset Performance
- 24-Hour Price Changes

## 🎯 Use Cases

Perfect for:
- 👤 Individual crypto investors
- 📊 Portfolio performance tracking
- 💰 Profit/loss monitoring
- 📈 Investment analysis
- 🎓 Learning project for Next.js + Supabase

## 🔒 Security

- ✅ Row Level Security on all database tables
- ✅ Secure authentication with Supabase
- ✅ Environment variables for sensitive data
- ✅ User data isolation
- ✅ HTTPS enforced in production

## 📦 What's Included

```
✅ Full authentication system
✅ Portfolio CRUD operations
✅ Real-time crypto price integration
✅ Profit/loss calculations
✅ Interactive charts
✅ Responsive UI
✅ Dark mode design
✅ Auto-refresh functionality
✅ Database with RLS policies
✅ TypeScript throughout
✅ Production-ready build
```

## 🚀 Deploy

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for the free crypto API
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Next.js](https://nextjs.org/) for the amazing framework
- [TailwindCSS](https://tailwindcss.com/) for the styling

## 💡 Future Enhancements

- Portfolio history tracking (graph over time)
- Price alerts and notifications
- Import from exchanges (Binance, Coinbase)
- Multiple wallets
- Tax reporting
- Mobile app

## 📧 Support

Need help? Check out:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Built with ❤️ using Next.js and Supabase**

**Star ⭐ this repo if you find it helpful!**

