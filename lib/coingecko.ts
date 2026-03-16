import { CryptoPrice } from '@/types'
import { getCMCPrices } from './coinmarketcap'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const PRICE_CACHE_KEY = 'crypto_price_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Cache interface
interface PriceCache {
    prices: CryptoPrice
    timestamp: number
}

// Get cached prices from localStorage
function getCachedPrices(): PriceCache | null {
    if (typeof window === 'undefined') return null

    try {
        const cached = localStorage.getItem(PRICE_CACHE_KEY)
        if (!cached) return null

        const data: PriceCache = JSON.parse(cached)
        const age = Date.now() - data.timestamp

        // Return cached data even if old (for fallback), but flag it
        return data
    } catch (error) {
        console.error('Error reading price cache:', error)
        return null
    }
}

// Save prices to localStorage
function cachePrices(prices: CryptoPrice): void {
    if (typeof window === 'undefined') return

    try {
        const cache: PriceCache = {
            prices,
            timestamp: Date.now()
        }
        localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
        console.error('Error saving price cache:', error)
    }
}

// Retry logic with exponential backoff
async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = 3,
    backoff = 1000
): Promise<Response> {
    try {
        const response = await fetch(url, options)
        if (response.ok) return response

        // If rate limited (429), wait longer
        if (response.status === 429 && retries > 0) {
            console.warn(`Rate limited, retrying in ${backoff * 2}ms...`)
            await new Promise(resolve => setTimeout(resolve, backoff * 2))
            return fetchWithRetry(url, options, retries - 1, backoff * 2)
        }

        throw new Error(`HTTP ${response.status}`)
    } catch (error) {
        if (retries > 0) {
            console.warn(`Fetch failed, retrying in ${backoff}ms...`, error)
            await new Promise(resolve => setTimeout(resolve, backoff))
            return fetchWithRetry(url, options, retries - 1, backoff * 2)
        }
        throw error
    }
}

// Optimized price fetching with CMC primary, CoinGecko fallback
export async function getCryptoPrices(coinIds: string[]): Promise<CryptoPrice> {
    try {
        if (coinIds.length === 0) {
            return {}
        }

        // Try CoinMarketCap first (if API key is configured)
        const symbols = coinIds.map(id => coinGeckoIdToSymbol(id)).filter(s => s !== null) as string[]
        if (symbols.length > 0) {
            try {
                const cmcPrices = await getCMCPrices(symbols)
                if (Object.keys(cmcPrices).length > 0) {
                    // Convert symbol-based prices back to coinId-based format
                    const prices: CryptoPrice = {}
                    coinIds.forEach(coinId => {
                        const symbol = coinGeckoIdToSymbol(coinId)
                        if (symbol && cmcPrices[symbol]) {
                            prices[coinId] = cmcPrices[symbol]
                        }
                    })

                    if (Object.keys(prices).length > 0) {
                        // Cache CMC prices
                        const cached = getCachedPrices()
                        const mergedPrices = { ...cached?.prices, ...prices }
                        cachePrices(mergedPrices)
                        console.log('✅ CMC prices used:', Object.keys(prices).length, 'coins')
                        return mergedPrices
                    }
                }
            } catch (cmcError) {
                console.warn('⚠️ CMC failed, falling back to CoinGecko:', cmcError)
            }
        }

        // Fallback to CoinGecko
        const ids = coinIds.join(',')
        const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`

        // Try to fetch fresh prices with retry logic
        try {
            const response = await fetchWithRetry(url, {
                next: { revalidate: 10 },
                signal: AbortSignal.timeout(8000) // 8 second timeout (increased for retries)
            })

            const prices = await response.json()

            // Validate response has data
            if (prices && Object.keys(prices).length > 0) {
                // Merge with cached prices to fill any gaps
                const cached = getCachedPrices()
                const mergedPrices = { ...cached?.prices, ...prices }

                // Cache successful response
                cachePrices(mergedPrices)
                console.log('✅ CoinGecko prices fetched:', Object.keys(prices).length, 'coins')
                return mergedPrices
            }
        } catch (fetchError) {
            console.error('❌ CoinGecko API fetch failed:', fetchError)
        }

        // Fallback to cached prices if both APIs fail
        const cached = getCachedPrices()
        if (cached && cached.prices && Object.keys(cached.prices).length > 0) {
            const age = Math.floor((Date.now() - cached.timestamp) / 1000 / 60)
            console.warn(`⚠️ Using cached prices (${age} minutes old)`)
            return cached.prices
        }

        console.error('❌ No cached prices available')
        return {}
    } catch (error) {
        console.error('Error in getCryptoPrices:', error)

        // Last resort: try to return any cached data
        const cached = getCachedPrices()
        return cached?.prices || {}
    }
}

export async function searchCrypto(query: string) {
    try {
        const url = `${COINGECKO_API_BASE}/search?query=${encodeURIComponent(query)}`
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`)
        }

        const data = await response.json()
        return data.coins.slice(0, 10).map((coin: any) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            logo: coin.thumb || coin.large || coin.small || '',
        }))
    } catch (error) {
        console.error('Error searching crypto:', error)
        return []
    }
}

// Map common symbols to CoinGecko IDs (expanded for better coverage)
export function symbolToCoinGeckoId(symbol: string): string {
    const symbolMap: { [key: string]: string } = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'BNB': 'binancecoin',
        'SOL': 'solana',
        'XRP': 'ripple',
        'ADA': 'cardano',
        'DOGE': 'dogecoin',
        'MATIC': 'matic-network',
        'DOT': 'polkadot',
        'AVAX': 'avalanche-2',
        'SHIB': 'shiba-inu',
        'LTC': 'litecoin',
        'LINK': 'chainlink',
        'UNI': 'uniswap',
        'ATOM': 'cosmos',
        'TRX': 'tron',
        'APT': 'aptos',
        'ARB': 'arbitrum',
        'OP': 'optimism',
        'NEAR': 'near',
        'FIL': 'filecoin',
        'VET': 'vechain',
        'ICP': 'internet-computer',
        'HBAR': 'hedera-hashgraph',
        'QNT': 'quant-network',
        'STX': 'blockstack',
        'IMX': 'immutable-x',
        'AAVE': 'aave',
        'MKR': 'maker',
        'SNX': 'havven',
        'CRV': 'curve-dao-token',
        'ALGO': 'algorand',
        'ETC': 'ethereum-classic',
        'BCH': 'bitcoin-cash',
        'XLM': 'stellar',
        'XMR': 'monero',
        'TON': 'the-open-network',
        'INJ': 'injective-protocol',
        'RUNE': 'thorchain',
        'FTM': 'fantom',
        'MANA': 'decentraland',
        'SAND': 'the-sandbox',
        'AXS': 'axie-infinity',
        'THETA': 'theta-token',
        'EGLD': 'elrond-erd-2',
    }

    const upperSymbol = symbol.toUpperCase()
    const mapped = symbolMap[upperSymbol]

    if (mapped) {
        return mapped
    }

    // Fallback: try lowercase symbol (works for many coins)
    console.warn(`No mapping for ${symbol}, using lowercase fallback`)
    return symbol.toLowerCase()
}

// Reverse mapping: CoinGecko ID to Symbol
export function coinGeckoIdToSymbol(coinGeckoId: string): string | null {
    const symbolMap: { [key: string]: string } = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'binancecoin': 'BNB',
        'solana': 'SOL',
        'ripple': 'XRP',
        'cardano': 'ADA',
        'dogecoin': 'DOGE',
        'matic-network': 'MATIC',
        'polkadot': 'DOT',
        'avalanche-2': 'AVAX',
        'shiba-inu': 'SHIB',
        'litecoin': 'LTC',
        'chainlink': 'LINK',
        'uniswap': 'UNI',
        'cosmos': 'ATOM',
        'tron': 'TRX',
        'aptos': 'APT',
        'arbitrum': 'ARB',
        'optimism': 'OP',
        'near': 'NEAR',
        'filecoin': 'FIL',
        'vechain': 'VET',
        'internet-computer': 'ICP',
        'hedera-hashgraph': 'HBAR',
        'quant-network': 'QNT',
        'blockstack': 'STX',
        'immutable-x': 'IMX',
        'aave': 'AAVE',
        'maker': 'MKR',
        'havven': 'SNX',
        'curve-dao-token': 'CRV',
        'algorand': 'ALGO',
        'ethereum-classic': 'ETC',
        'bitcoin-cash': 'BCH',
        'stellar': 'XLM',
        'monero': 'XMR',
        'the-open-network': 'TON',
        'injective-protocol': 'INJ',
        'thorchain': 'RUNE',
        'fantom': 'FTM',
        'decentraland': 'MANA',
        'the-sandbox': 'SAND',
        'axie-infinity': 'AXS',
        'theta-token': 'THETA',
        'elrond-erd-2': 'EGLD',
    }

    return symbolMap[coinGeckoId.toLowerCase()] || null
}
