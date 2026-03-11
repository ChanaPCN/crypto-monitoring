-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table (replaces portfolio table with better structure)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_symbol TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    buy_price NUMERIC NOT NULL CHECK (buy_price > 0),
    buy_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep portfolio table for backward compatibility (will be deprecated)
CREATE TABLE IF NOT EXISTS public.portfolio (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    coin_symbol TEXT NOT NULL,
    coin_name TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    buy_price NUMERIC NOT NULL CHECK (buy_price > 0),
    buy_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create portfolio_history table
CREATE TABLE IF NOT EXISTS public.portfolio_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_value NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON public.portfolio;

DROP POLICY IF EXISTS "Users can view own history" ON public.portfolio_history;
DROP POLICY IF EXISTS "Users can insert own history" ON public.portfolio_history;

-- Create RLS policies for transactions table
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for portfolio table
CREATE POLICY "Users can view own portfolio"
    ON public.portfolio FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
    ON public.portfolio FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
    ON public.portfolio FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
    ON public.portfolio FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for portfolio_history table
CREATE POLICY "Users can view own history"
    ON public.portfolio_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
    ON public.portfolio_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_coin_symbol ON public.transactions(user_id, coin_symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_buy_date ON public.transactions(buy_date DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_user_id ON public.portfolio_history(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_history_timestamp ON public.portfolio_history(timestamp DESC);

-- Create a function to automatically save portfolio history
CREATE OR REPLACE FUNCTION save_portfolio_snapshot()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This can be called periodically to save portfolio snapshots
    -- For now, it's a placeholder for future automation
    NULL;
END;
$$;
