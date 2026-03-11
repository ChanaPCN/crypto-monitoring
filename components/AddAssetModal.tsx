'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { searchCrypto } from '@/lib/coingecko'
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

    const selectCoin = (coin: any) => {
        setCoinSymbol(coin.symbol)
        setCoinName(coin.name)
        setCoinId(coin.id || '')
        setLogoUrl(coin.logo || '')
        setSearchResults([])
    }

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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-2xl p-8 max-w-md w-full shadow-medium">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-3xl leading-none apple-transition"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Cryptocurrency
                        </label>
                        <input
                            type="text"
                            value={coinSymbol}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search (e.g., BTC, ETH)"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent apple-transition"
                        />
                        {searching && (
                            <div className="absolute right-3 top-11 text-gray-400 text-sm">
                                Searching...
                            </div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-medium max-h-48 overflow-y-auto">
                                {searchResults.map((coin) => (
                                    <button
                                        key={coin.id}
                                        type="button"
                                        onClick={() => selectCoin(coin)}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 apple-transition flex items-center gap-3 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        {coin.logo ? (
                                            <img
                                                src={coin.logo}
                                                alt={coin.name}
                                                className="w-8 h-8 rounded-full shadow-soft"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white text-sm font-bold">
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
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Coin Name
                        </label>
                        <input
                            type="text"
                            value={coinName}
                            onChange={(e) => setCoinName(e.target.value)}
                            placeholder="e.g., Bitcoin"
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent apple-transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent apple-transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Price (USD)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                placeholder="0.00"
                                required
                                min="0"
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent apple-transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Buy Date
                        </label>
                        <input
                            type="date"
                            value={buyDate}
                            onChange={(e) => setBuyDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent apple-transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Bought during the dip, DCA strategy, etc."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent resize-none apple-transition"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg apple-transition shadow-soft hover:shadow-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-apple-blue text-white font-semibold rounded-lg apple-transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
                        >
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
