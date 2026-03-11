'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { searchCrypto } from '@/lib/coingecko'

interface Props {
    onClose: () => void
    onSuccess: () => void
    prefilledCoin?: { symbol: string; name: string } | null
}

export default function AddAssetModal({ onClose, onSuccess, prefilledCoin }: Props) {
    const [coinSymbol, setCoinSymbol] = useState(prefilledCoin?.symbol || '')
    const [coinName, setCoinName] = useState(prefilledCoin?.name || '')
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
        setSearchResults([])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error: insertError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    coin_symbol: coinSymbol.toUpperCase(),
                    coin_name: coinName,
                    amount: parseFloat(amount),
                    buy_price: parseFloat(buyPrice),
                    buy_date: new Date(buyDate).toISOString(),
                    notes: notes || null,
                })

            if (insertError) throw insertError

            onSuccess()
        } catch (error: any) {
            setError(error.message || 'Failed to add asset')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Add Transaction</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Cryptocurrency
                        </label>
                        <input
                            type="text"
                            value={coinSymbol}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search (e.g., BTC, ETH)"
                            required
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {searching && (
                            <div className="absolute right-3 top-9 text-gray-400">
                                Searching...
                            </div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg max-h-48 overflow-y-auto">
                                {searchResults.map((coin) => (
                                    <button
                                        key={coin.id}
                                        type="button"
                                        onClick={() => selectCoin(coin)}
                                        className="w-full px-3 py-2 text-left hover:bg-gray-600 transition-colors"
                                    >
                                        <div className="font-medium">{coin.symbol}</div>
                                        <div className="text-sm text-gray-400">{coin.name}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Coin Name
                        </label>
                        <input
                            type="text"
                            value={coinName}
                            onChange={(e) => setCoinName(e.target.value)}
                            placeholder="e.g., Bitcoin"
                            required
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
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
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Buy Price (USD)
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={buyPrice}
                            onChange={(e) => setBuyPrice(e.target.value)}
                            placeholder="0.00"
                            required
                            min="0"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Buy Date
                        </label>
                        <input
                            type="date"
                            value={buyDate}
                            onChange={(e) => setBuyDate(e.target.value)}
                            required
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="e.g., Bought during the dip, DCA strategy, etc."
                            rows={3}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Adding...' : 'Add Transaction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
