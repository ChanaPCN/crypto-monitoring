'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { searchCrypto, getCryptoPrices, symbolToCoinGeckoId } from '@/lib/coingecko'
import {
    validateCryptoAmount,
    validatePrice,
    validateCoinSymbol,
    validateDate,
    sanitizeInput
} from '@/lib/security'

interface Props {
    onClose: () => void
    onSuccess: () => void
    prefilledCoin?: { symbol: string; name: string } | null
}

export default function AddAssetModal({ onClose, onSuccess, prefilledCoin }: Props) {
    const [coinSymbol, setCoinSymbol] = useState(prefilledCoin?.symbol || '')
    const [coinName, setCoinName] = useState(prefilledCoin?.name || '')
    const [coinId, setCoinId] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [amount, setAmount] = useState('')
    const [buyPrice, setBuyPrice] = useState('')
    const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [showNotes, setShowNotes] = useState(false)
    const [selectedCoin, setSelectedCoin] = useState<any>(null)
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)
    const [loadingPrice, setLoadingPrice] = useState(false)

    // Prefill coin data if provided
    useEffect(() => {
        if (prefilledCoin) {
            setCoinSymbol(prefilledCoin.symbol)
            setCoinName(prefilledCoin.name)
        }
    }, [prefilledCoin])

    const handleSearch = async (query: string) => {
        setCoinSymbol(query)
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setSearching(true)
        try {
            const results = await searchCrypto(query)
            setSearchResults(results)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setSearching(false)
        }
    }

    const selectCoin = async (coin: any) => {
        setCoinSymbol(coin.symbol)
        setCoinName(coin.name)
        setCoinId(coin.id || '')
        setLogoUrl(coin.logo || '')
        setSelectedCoin(coin)
        setSearchResults([])

        // Fetch current price
        if (coin.symbol) {
            setLoadingPrice(true)
            try {
                const coinGeckoId = symbolToCoinGeckoId(coin.symbol)
                const prices = await getCryptoPrices([coinGeckoId])
                const priceData = prices[coinGeckoId]
                if (priceData && priceData.usd) {
                    setCurrentPrice(priceData.usd)
                } else {
                    setCurrentPrice(null)
                }
            } catch (error) {
                console.error('Error fetching current price:', error)
                setCurrentPrice(null)
            } finally {
                setLoadingPrice(false)
            }
        }
    }

    // Calculate total investment
    const totalInvestment = amount && buyPrice
        ? (parseFloat(amount) * parseFloat(buyPrice)).toFixed(2)
        : '0.00'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        // Comprehensive input validation
        if (!coinSymbol || !coinName || !amount || !buyPrice || !buyDate) {
            setError('Please fill in all required fields')
            return
        }

        // Validate coin symbol
        if (!validateCoinSymbol(coinSymbol)) {
            setError('Invalid coin symbol. Only alphanumeric characters allowed (max 10 chars)')
            return
        }

        // Validate amount
        if (!validateCryptoAmount(amount)) {
            setError('Invalid amount. Must be a positive number with max 18 decimal places')
            return
        }

        // Validate price
        if (!validatePrice(buyPrice)) {
            setError('Invalid price. Must be a positive number')
            return
        }

        // Validate date
        if (!validateDate(buyDate)) {
            setError('Invalid date. Date must be between 2009 and today')
            return
        }

        // Sanitize text inputs
        const sanitizedNotes = notes ? sanitizeInput(notes) : null
        const sanitizedCoinName = sanitizeInput(coinName)
        const sanitizedCoinSymbol = coinSymbol.toUpperCase().trim()

        // Validate sanitized data lengths
        if (sanitizedCoinName.length > 100) {
            setError('Coin name too long')
            return
        }

        if (sanitizedNotes && sanitizedNotes.length > 500) {
            setError('Notes too long (max 500 characters)')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create timestamp with selected date but current time
            // This allows multiple transactions on same day while keeping unique timestamps
            const selectedDate = new Date(buyDate)
            const now = new Date()
            const timestamp = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                now.getHours(),
                now.getMinutes(),
                now.getSeconds(),
                now.getMilliseconds()
            )

            const { error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    coin_symbol: sanitizedCoinSymbol,
                    coin_name: sanitizedCoinName,
                    coin_id: coinId || null,
                    logo_url: logoUrl || null,
                    amount: parseFloat(amount),
                    buy_price: parseFloat(buyPrice),
                    buy_date: timestamp.toISOString(),
                    notes: sanitizedNotes,
                })

            if (insertError) throw insertError

            onSuccess()
        } catch (error: any) {
            setError(error.message || 'Failed to add transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center"
            onClick={onClose}
        >
            {/* Bottom Sheet - Slides from bottom on mobile, centered modal on desktop */}
            <div
                className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg sm:mx-4 shadow-2xl animate-slide-up"
                style={{
                    maxHeight: '90vh',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                        Add Transaction
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200"
                        aria-label="Close"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-5 py-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {/* Coin Search - Autocomplete with icons */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coin
                            </label>
                            {selectedCoin ? (
                                // Selected coin display
                                <div
                                    className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-all duration-200"
                                    onClick={() => {
                                        setSelectedCoin(null)
                                        setCoinSymbol('')
                                        setCoinName('')
                                        setCurrentPrice(null)
                                    }}
                                >
                                    {selectedCoin.logo ? (
                                        <img
                                            src={selectedCoin.logo}
                                            alt={selectedCoin.name}
                                            className="w-10 h-10 rounded-full shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {selectedCoin.symbol.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{selectedCoin.symbol}</div>
                                        <div className="text-sm text-gray-500">{selectedCoin.name}</div>
                                        {loadingPrice ? (
                                            <div className="text-xs text-gray-400 mt-0.5">Loading price...</div>
                                        ) : currentPrice !== null ? (
                                            <div className="text-xs text-blue-600 font-medium mt-0.5">
                                                Current: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        ) : null}
                                    </div>
                                    <button
                                        type="button"
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                // Search input
                                <>
                                    <input
                                        type="text"
                                        value={coinSymbol}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Search coin (e.g., BTC, ETH)"
                                        required
                                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        style={{ fontSize: '16px' }}
                                    />
                                    {searching && (
                                        <div className="absolute right-4 top-12 text-gray-400 text-sm">
                                            Searching...
                                        </div>
                                    )}
                                    {searchResults.length > 0 && (
                                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                            {searchResults.map((coin) => (
                                                <button
                                                    key={coin.id}
                                                    type="button"
                                                    onClick={() => selectCoin(coin)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-all duration-200 flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-0"
                                                >
                                                    {coin.logo ? (
                                                        <img
                                                            src={coin.logo}
                                                            alt={coin.name}
                                                            className="w-9 h-9 rounded-full shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                                            {coin.symbol.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{coin.symbol}</div>
                                                        <div className="text-xs text-gray-500">{coin.name}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Amount & Price - Visually grouped */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        min="0"
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        style={{ fontSize: '16px' }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                        Buy Price (USD)
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={buyPrice}
                                        onChange={(e) => setBuyPrice(e.target.value)}
                                        placeholder="$0.00"
                                        required
                                        min="0"
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        style={{ fontSize: '16px' }}
                                    />
                                </div>
                            </div>

                            {/* Auto-calculated total */}
                            {parseFloat(totalInvestment) > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-gray-600">Total Investment</span>
                                        <span className="text-lg font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                                            ${parseFloat(totalInvestment).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Buy Date - Less prominent, defaults to Today */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                Buy Date (optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={buyDate}
                                    onChange={(e) => setBuyDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    style={{ fontSize: '16px' }}
                                />
                                {buyDate === new Date().toISOString().split('T')[0] && (
                                    <div className="absolute right-4 top-3 text-xs text-gray-400 pointer-events-none">
                                        Today
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes - Collapsible */}
                        {!showNotes ? (
                            <button
                                type="button"
                                onClick={() => setShowNotes(true)}
                                className="w-full py-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                Add note (optional)
                            </button>
                        ) : (
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-gray-600">
                                        Note
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNotes(false)
                                            setNotes('')
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g., Bought during the dip, DCA strategy..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                                    style={{ fontSize: '16px' }}
                                />
                            </div>
                        )}
                    </form>
                </div>

                {/* Fixed Bottom Actions */}
                <div className="px-5 py-4 border-t border-gray-100 bg-white rounded-b-3xl sm:rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm disabled:cursor-not-allowed active:scale-[0.98]"
                        style={{ fontSize: '16px' }}
                    >
                        {loading ? 'Adding Transaction...' : 'Add Transaction'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full mt-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-all duration-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    )
}
