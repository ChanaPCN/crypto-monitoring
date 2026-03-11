import { CryptoPrice } from '@/types'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

export async function getCryptoPrices(coinIds: string[]): Promise<CryptoPrice> {
    try {
        if (coinIds.length === 0) {
            return {}
        }

        const ids = coinIds.join(',')
        const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`

        const response = await fetch(url, {
            next: { revalidate: 30 } // Cache for 30 seconds
        })

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching crypto prices:', error)
        return {}
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
        }))
    } catch (error) {
        console.error('Error searching crypto:', error)
        return []
    }
}

// Map common symbols to CoinGecko IDs
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
    }

    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase()
}
