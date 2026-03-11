export interface Transaction {
    id: string
    user_id: string
    coin_symbol: string
    coin_name: string
    amount: number
    buy_price: number
    buy_date: string
    notes?: string
    created_at: string
}

export interface PortfolioAsset {
    id: string
    user_id: string
    coin_symbol: string
    coin_name: string
    amount: number
    buy_price: number
    buy_date: string
    created_at: string
}

export interface CryptoPrice {
    [key: string]: {
        usd: number
        usd_24h_change: number
    }
}

export interface PortfolioSummary {
    totalValue: number
    totalInvested: number
    totalProfit: number
    profitPercentage: number
    change24h: number
}

export interface AssetWithPrice extends PortfolioAsset {
    currentPrice: number
    currentValue: number
    investedValue: number
    profit: number
    profitPercentage: number
    change24h: number
}

export interface AggregatedAsset {
    coin_symbol: string
    coin_name: string
    totalAmount: number
    averageBuyPrice: number
    totalInvested: number
    transactions: Transaction[]
    currentPrice: number
    currentValue: number
    profit: number
    profitPercentage: number
    change24h: number
}
