-- Add coin_id and logo_url columns to transactions table
-- Run this in Supabase SQL Editor

-- Add coin_id column to store CoinGecko coin ID
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS coin_id TEXT;

-- Add logo_url column to store coin logo image URL
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Create index on coin_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_coin_id ON transactions(coin_id);

-- Optional: Add the same columns to the old portfolio table for consistency
ALTER TABLE portfolio
ADD COLUMN IF NOT EXISTS coin_id TEXT;

ALTER TABLE portfolio
ADD COLUMN IF NOT EXISTS logo_url TEXT;

CREATE INDEX IF NOT EXISTS idx_portfolio_coin_id ON portfolio(coin_id);
