'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AssetWithPrice } from '@/types'

interface Props {
    asset: AssetWithPrice
    onClose: () => void
    onSuccess: () => void
}

export default function EditAssetModal({ asset, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState(asset.amount.toString())
    const [buyPrice, setBuyPrice] = useState(asset.buy_price.toString())
    const [buyDate, setBuyDate] = useState(asset.buy_date.split('T')[0])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { error: updateError } = await supabase
                .from('portfolio')
                .update({
                    amount: parseFloat(amount),
                    buy_price: parseFloat(buyPrice),
                    buy_date: new Date(buyDate).toISOString(),
                })
                .eq('id', asset.id)

            if (updateError) throw updateError

            onSuccess()
        } catch (error: any) {
            setError(error.message || 'Failed to update asset')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Edit Asset</h2>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Cryptocurrency
                        </label>
                        <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                            {asset.coin_symbol} - {asset.coin_name}
                        </div>
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
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
