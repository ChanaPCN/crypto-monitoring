import { NextRequest, NextResponse } from 'next/server'

// Mark this route as dynamic (it reads searchParams)
export const dynamic = 'force-dynamic'

const CMC_API_BASE = 'https://pro-api.coinmarketcap.com/v2'
const CMC_API_KEY = process.env.NEXT_PUBLIC_CMC_API_KEY || ''

// Symbol to CoinMarketCap ID mapping
const symbolToCMCId: { [key: string]: number } = {
    'BTC': 1,        // Bitcoin
    'ETH': 1027,     // Ethereum
    'BNB': 1839,     // Binance Coin
    'SOL': 5426,     // Solana
    'XRP': 52,       // XRP
    'ADA': 2010,     // Cardano
    'DOGE': 74,      // Dogecoin
    'TRX': 1958,     // TRON
    'MATIC': 3890,   // Polygon
    'DOT': 6636,     // Polkadot
    'LTC': 2,        // Litecoin
    'SHIB': 5994,    // Shiba Inu
    'AVAX': 5805,    // Avalanche
    'UNI': 7083,     // Uniswap
    'LINK': 1975,    // Chainlink
    'ATOM': 3794,    // Cosmos
    'XLM': 512,      // Stellar
    'XMR': 328,      // Monero
    'ETC': 1321,     // Ethereum Classic
    'BCH': 1831,     // Bitcoin Cash
    'ALGO': 4030,    // Algorand
    'FIL': 2280,     // Filecoin
    'VET': 3077,     // VeChain
    'HBAR': 4642,    // Hedera
    'ICP': 8916,     // Internet Computer
    'APT': 21794,    // Aptos
    'NEAR': 6535,    // NEAR Protocol
    'QNT': 3155,     // Quant
    'ARB': 11841,    // Arbitrum
    'OP': 11840,     // Optimism
    'STX': 4847,     // Stacks
    'IMX': 10603,    // Immutable X
    'AAVE': 7278,    // Aave
    'MKR': 1518,     // Maker
    'SNX': 2586,     // Synthetix
    'CRV': 6538,     // Curve DAO
    'SAND': 6210,    // The Sandbox
    'MANA': 1966,    // Decentraland
    'AXS': 6783,     // Axie Infinity
    'FLOW': 4558,    // Flow
    'FTM': 3513,     // Fantom
    'THETA': 2416,   // Theta Network
    'XTZ': 2011,     // Tezos
    'EOS': 1765,     // EOS
    'KCS': 2087,     // KuCoin Token
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const symbolsParam = searchParams.get('symbols')

        if (!symbolsParam) {
            return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 })
        }

        if (!CMC_API_KEY) {
            return NextResponse.json({ error: 'CMC API key not configured' }, { status: 500 })
        }

        const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase())

        // Convert symbols to CMC IDs
        const ids = symbols
            .map(symbol => symbolToCMCId[symbol])
            .filter(id => id !== undefined)
            .join(',')

        if (!ids) {
            return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 })
        }

        const url = `${CMC_API_BASE}/cryptocurrency/quotes/latest?id=${ids}&convert=USD`

        console.log('🔍 Fetching from CMC:', url)

        const response = await fetch(url, {
            headers: {
                'X-CMC_PRO_API_KEY': CMC_API_KEY,
                'Accept': 'application/json'
            },
            next: { revalidate: 60 } // Cache for 60 seconds
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ CMC API error:', response.status, errorText)
            return NextResponse.json({ error: 'CMC API error', details: errorText }, { status: response.status })
        }

        const data = await response.json()

        // Transform CMC response to our format (symbol-based)
        const prices: { [symbol: string]: { usd: number; usd_24h_change: number } } = {}

        if (data.data) {
            Object.values(data.data).forEach((coin: any) => {
                const symbol = coin.symbol
                const quote = coin.quote?.USD

                if (quote && quote.price) {
                    prices[symbol] = {
                        usd: quote.price,
                        usd_24h_change: quote.percent_change_24h || 0
                    }
                }
            })
        }

        console.log('✅ CMC prices fetched:', Object.keys(prices))

        return NextResponse.json(prices)

    } catch (error) {
        console.error('❌ Error in price API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
