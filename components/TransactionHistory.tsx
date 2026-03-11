'use client'

import { Transaction } from '@/types'
import { useState } from 'react'

interface Props {
    transactions: Transaction[]
    coinSymbol: string
    coinName: string
    onClose: () => void
    onDeleteTransaction: (id: string) => void
}

export default function TransactionHistory({
    transactions,
    coinSymbol,
    coinName,
    onClose,
    onDeleteTransaction
}: Props) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const formatNumber = (value: number) => {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return

        setDeletingId(id)
        await onDeleteTransaction(id)
        setDeletingId(null)
    }

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalInvested = transactions.reduce((sum, t) => sum + (t.amount * t.buy_price), 0)
    const avgBuyPrice = totalInvested / totalAmount

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">{coinSymbol} Transaction History</h2>
                            <p className="text-gray-400 mt-1">{coinName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-gray-750 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Transactions</p>
                            <p className="text-2xl font-bold mt-1">{transactions.length}</p>
                        </div>
                        <div className="bg-gray-750 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Total Amount</p>
                            <p className="text-2xl font-bold mt-1">{formatNumber(totalAmount)}</p>
                        </div>
                        <div className="bg-gray-750 p-4 rounded-lg">
                            <p className="text-sm text-gray-400">Avg Buy Price</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(avgBuyPrice)}</p>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-gray-750 p-4 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-400 font-semibold">BUY</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-300">{formatDate(transaction.buy_date)}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-gray-400">Amount</p>
                                                <p className="font-semibold">{formatNumber(transaction.amount)} {coinSymbol}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Buy Price</p>
                                                <p className="font-semibold">{formatCurrency(transaction.buy_price)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Total Cost</p>
                                                <p className="font-semibold">{formatCurrency(transaction.amount * transaction.buy_price)}</p>
                                            </div>
                                        </div>

                                        {transaction.notes && (
                                            <div className="mt-2">
                                                <p className="text-xs text-gray-400">Notes</p>
                                                <p className="text-sm text-gray-300">{transaction.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleDelete(transaction.id)}
                                        disabled={deletingId === transaction.id}
                                        className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
