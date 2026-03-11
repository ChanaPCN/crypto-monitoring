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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-[520px] w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header - Clean & Minimal */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                                {coinSymbol} Transaction History
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">{coinName}</p>
                        </div>
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

                    {/* Inline Stats - Clean chips */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium">
                            {transactions.length} {transactions.length === 1 ? 'Transaction' : 'Transactions'}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium">
                            {formatNumber(totalAmount)} {coinSymbol}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg font-medium">
                            Avg {formatCurrency(avgBuyPrice)}
                        </span>
                    </div>
                </div>

                {/* Transaction List - Scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-3">
                        {transactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="bg-white border border-gray-200 rounded-2xl p-4 transition-all duration-200 hover:border-blue-500 group"
                            >
                                {/* Header: BUY • Date */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-semibold text-sm uppercase">BUY</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-sm text-gray-600">{formatDate(transaction.buy_date)}</span>
                                    </div>
                                </div>

                                {/* Transaction Details - Clean structure */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Amount</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatNumber(transaction.amount)} {coinSymbol}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Price</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(transaction.buy_price)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-700">Total</span>
                                        <span className="font-semibold text-gray-900">
                                            {formatCurrency(transaction.amount * transaction.buy_price)}
                                        </span>
                                    </div>
                                </div>

                                {/* Notes - Distinguished with italic */}
                                {transaction.notes && (
                                    <div className="mb-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
                                        <p className="text-sm text-gray-600 italic">{transaction.notes}</p>
                                    </div>
                                )}

                                {/* Delete Button - Subtle text link */}
                                <div className="pt-2">
                                    <button
                                        onClick={() => confirmDelete(transaction)}
                                        disabled={deletingId === transaction.id}
                                        className="text-sm text-gray-400 hover:text-red-500 transition-colors duration-200 disabled:opacity-50 font-medium"
                                    >
                                        {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal - Clean fintech style */}
            {showDeleteConfirm && transactionToDelete && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Date</span>
                                    <span className="text-gray-900 font-medium">{formatDate(transactionToDelete.buy_date)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Amount</span>
                                    <span className="text-gray-900 font-medium">{formatNumber(transactionToDelete.amount)} {coinSymbol}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Price</span>
                                    <span className="text-gray-900 font-medium">{formatCurrency(transactionToDelete.buy_price)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200">
                                    <span className="text-gray-700 font-semibold">Total</span>
                                    <span className="text-gray-900 font-semibold">{formatCurrency(transactionToDelete.amount * transactionToDelete.buy_price)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                disabled={deletingId !== null}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(transactionToDelete.id)}
                                disabled={deletingId !== null}
                                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                            >
                                {deletingId === transactionToDelete.id ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
