import { CryptoPrice } from '@/types'

const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v2'
const CMC_API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY || ''

// Map symbols to CoinMarketCap IDs
const symbolToCMCId: { [key: string]: number } = {
    'BTC': 1,
    'ETH': 1027,
    'USDT': 825,
    'BNB': 1839,
    'SOL': 5426,
    'XRP': 52,
    'USDC': 3408,
    'ADA': 2010,
    'DOGE': 74,
    'TRX': 1958,
    'LINK': 1975,
    'MATIC': 3890,
    'DOT': 6636,
    'AVAX': 5805,
    'SHIB': 5994,
    'LTC': 2,
    'UNI': 7083,
    'ATOM': 3794,
    'APT': 21794,
    'ARB': 11841,
    'OP': 11840,
    'NEAR': 6535,
    'FIL': 2280,
    'VET': 3077,
    'ICP': 8916,
    'HBAR': 4642,
    'QNT': 3155,
    'STX': 4847,
    'IMX': 10603,
    'AAVE': 7278,
    'MKR': 1518,
    'SNX': 2586,
    'CRV': 6538,
    'ALGO': 4030,
    'ETC': 1321,
    'BCH': 1831,
    'XLM': 512,
    'XMR': 328,
    'TON': 11419,
    'INJ': 7226,
    'RUNE': 4157,
    'FTM': 3513,
    'MANA': 1966,
    'SAND': 6210,
    'AXS': 6783,
    'THETA': 2416,
    'EGLD': 6892,
}

// Convert symbols to CoinMarketCap IDs
function symbolsToIds(symbols: string[]): string {
    const ids = symbols
        .map(symbol => symbolToCMCId[symbol.toUpperCase()])
        .filter(id => id !== undefined)
    return ids.join(',')
}

// Fetch prices from CoinMarketCap via our internal API route
export async function getCMCPrices(symbols: string[]): Promise<CryptoPrice> {
    if (symbols.length === 0) {
        return {}
    }

    try {
        // Call our internal API route instead of CMC directly (to avoid CORS issues)
        const url = `/api/prices?symbols=${symbols.join(',')}`

        console.log('🔍 Fetching prices via internal API:', symbols)

        const response = await fetch(url, {
            next: { revalidate: 60 }
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Internal API error: ${errorData.error}`)
        }

        const prices: CryptoPrice = await response.json()

        console.log('✅ CMC prices fetched:', Object.keys(prices).length, 'coins')
        return prices

    } catch (error) {
        console.error('❌ CMC API error:', error)
        return {}
    }
}

// Get symbol for a CMC ID (reverse lookup)
export function getSymbolFromCMCId(id: number): string | undefined {
    for (const [symbol, cmcId] of Object.entries(symbolToCMCId)) {
        if (cmcId === id) return symbol
    }
    return undefined
}
