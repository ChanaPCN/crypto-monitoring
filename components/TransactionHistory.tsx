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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

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
        setDeletingId(id)
        try {
            await onDeleteTransaction(id)
        } catch (error) {
            console.error('Delete error:', error)
        } finally {
            setDeletingId(null)
            setShowDeleteConfirm(false)
            setTransactionToDelete(null)
        }
    }

    const confirmDelete = (transaction: Transaction) => {
        setTransactionToDelete(transaction)
        setShowDeleteConfirm(true)
    }

    const cancelDelete = () => {
        setShowDeleteConfirm(false)
        setTransactionToDelete(null)
    }

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
    const totalInvested = transactions.reduce((sum, t) => sum + (t.amount * t.buy_price), 0)
    const avgBuyPrice = totalInvested / totalAmount

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-cyan-500/40 flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-pink-500/10">
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
                        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-cyan-500/20">
                            <p className="text-sm text-gray-400">Total Transactions</p>
                            <p className="text-2xl font-bold mt-1 text-cyan-300">{transactions.length}</p>
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20">
                            <p className="text-sm text-gray-400">Total Amount</p>
                            <p className="text-2xl font-bold mt-1 text-purple-300">{formatNumber(totalAmount)}</p>
                        </div>
                        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg border border-pink-500/20">
                            <p className="text-sm text-gray-400">Avg Buy Price</p>
                            <p className="text-2xl font-bold mt-1 text-pink-300">{formatCurrency(avgBuyPrice)}</p>
                        </div>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-black/30 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 hover:border-cyan-500/40 transition-all duration-200"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-400 font-semibold px-2 py-0.5 bg-green-500/20 rounded border border-green-500/30">BUY</span>
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
                                        onClick={() => confirmDelete(transaction)}
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && transactionToDelete && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                    <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border-2 border-red-600">
                        <h3 className="text-xl font-bold text-red-400 mb-3">⚠️ Confirm Deletion</h3>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to delete this transaction?
                        </p>

                        <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Date:</span>
                                    <span className="text-white">{formatDate(transactionToDelete.buy_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Amount:</span>
                                    <span className="text-white">{formatNumber(transactionToDelete.amount)} {coinSymbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Price:</span>
                                    <span className="text-white">{formatCurrency(transactionToDelete.buy_price)}</span>
                                </div>
                                <div className="flex justify-between border-t border-gray-700 pt-2">
                                    <span className="text-gray-400 font-semibold">Total:</span>
                                    <span className="text-white font-semibold">{formatCurrency(transactionToDelete.amount * transactionToDelete.buy_price)}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-red-300 mb-6">
                            ⚠️ This action cannot be undone!
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                disabled={deletingId !== null}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(transactionToDelete.id)}
                                disabled={deletingId !== null}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold disabled:opacity-50"
                            >
                                {deletingId === transactionToDelete.id ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
