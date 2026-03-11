'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Transaction, AggregatedAsset, PortfolioSummary } from '@/types'
import { getCryptoPrices, symbolToCoinGeckoId } from '@/lib/coingecko'
import AddAssetModal from '@/components/AddAssetModal'
import TransactionHistory from '@/components/TransactionHistory'
import PortfolioHeader from '@/components/PortfolioHeader'
import AggregatedPortfolioTable from '@/components/AggregatedPortfolioTable'
import PortfolioChart from '@/components/PortfolioChart'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [assets, setAssets] = useState<AggregatedAsset[]>([])
    const [summary, setSummary] = useState<PortfolioSummary>({
        totalValue: 0,
        totalInvested: 0,
        totalProfit: 0,
        profitPercentage: 0,
        change24h: 0,
    })
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [historyAsset, setHistoryAsset] = useState<AggregatedAsset | null>(null)
    const [prefilledCoin, setPrefilledCoin] = useState<{ symbol: string; name: string } | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        checkUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (user) {
            loadPortfolio()

            // Auto-refresh every 30 seconds
            const interval = setInterval(() => {
                setRefreshKey(prev => prev + 1)
            }, 30000)

            return () => clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, refreshKey])

    const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            router.push('/login')
            return
        }

        setUser(session.user)
    }

    const loadPortfolio = async () => {
        try {
            setLoading(true)

            // Fetch all user's transactions
            const { data: transactions, error } = await supabase
                .from('transactions')
                .select('*')
                .order('buy_date', { ascending: false })

            if (error) throw error

            if (!transactions || transactions.length === 0) {
                setAssets([])
                setSummary({
                    totalValue: 0,
                    totalInvested: 0,
                    totalProfit: 0,
                    profitPercentage: 0,
                    change24h: 0,
                })
                setLoading(false)
                return
            }

            // Group transactions by coin_symbol
            const groupedTransactions: { [key: string]: Transaction[] } = {}
            transactions.forEach((tx: Transaction) => {
                if (!groupedTransactions[tx.coin_symbol]) {
                    groupedTransactions[tx.coin_symbol] = []
                }
                groupedTransactions[tx.coin_symbol].push(tx)
            })

            // Get unique coin IDs for price fetching
            const coinIds = Object.keys(groupedTransactions).map(symbol =>
                symbolToCoinGeckoId(symbol)
            )

            // Fetch current prices
            const prices = await getCryptoPrices(coinIds)

            // Calculate aggregated assets
            const aggregatedAssets: AggregatedAsset[] = Object.entries(groupedTransactions).map(
                ([symbol, txs]) => {
                    const coinId = symbolToCoinGeckoId(symbol)
                    const priceData = prices[coinId]
                    const currentPrice = priceData?.usd || 0
                    const change24h = priceData?.usd_24h_change || 0

                    // Calculate totals
                    const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0)
                    const totalInvested = txs.reduce((sum, tx) => sum + (tx.amount * tx.buy_price), 0)
                    const averageBuyPrice = totalAmount > 0 ? totalInvested / totalAmount : 0

                    const currentValue = totalAmount * currentPrice
                    const profit = currentValue - totalInvested
                    const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0

                    return {
                        coin_symbol: symbol,
                        coin_name: txs[0].coin_name, // All transactions have the same coin_name
                        totalAmount,
                        averageBuyPrice,
                        currentPrice,
                        currentValue,
                        totalInvested,
                        profit,
                        profitPercentage,
                        change24h,
                        transactions: txs,
                    }
                }
            )

            // Calculate summary
            const totalValue = aggregatedAssets.reduce((sum, asset) => sum + asset.currentValue, 0)
            const totalInvested = aggregatedAssets.reduce((sum, asset) => sum + asset.totalInvested, 0)
            const totalProfit = totalValue - totalInvested
            const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

            // Calculate weighted 24h change
            const change24h = totalValue > 0
                ? aggregatedAssets.reduce((sum, asset) =>
                    sum + (asset.change24h * (asset.currentValue / totalValue)), 0)
                : 0

            setAssets(aggregatedAssets)
            setSummary({
                totalValue,
                totalInvested,
                totalProfit,
                profitPercentage,
                change24h,
            })
        } catch (error) {
            console.error('Error loading portfolio:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleViewHistory = (asset: AggregatedAsset) => {
        setHistoryAsset(asset)
    }

    const handleDeleteTransaction = async (transactionId: string) => {
        // This will be called from TransactionHistory component
        // No need to refresh here, just close modal and refresh
        await loadPortfolio()
    }

    const handleAddTransactionFor = (coinSymbol: string, coinName: string) => {
        setPrefilledCoin({ symbol: coinSymbol, name: coinName })
        setShowAddModal(true)
    }

    const handleCloseAddModal = () => {
        setShowAddModal(false)
        setPrefilledCoin(null)
    }

    const handleAddSuccess = () => {
        handleCloseAddModal()
        loadPortfolio()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">📊 Crypto Portfolio Monitor</h1>
                        <p className="text-gray-400 mt-1">{user?.email}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setRefreshKey(prev => prev + 1)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Refresh prices"
                        >
                            🔄 Refresh
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        >
                            + Add Transaction
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-400">Loading portfolio...</p>
                    </div>
                ) : (
                    <>
                        {/* Portfolio Summary */}
                        <PortfolioHeader summary={summary} />

                        {/* Portfolio Chart */}
                        {assets.length > 0 && (
                            <PortfolioChart assets={assets} />
                        )}

                        {/* Portfolio Table */}
                        <AggregatedPortfolioTable
                            assets={assets}
                            onViewHistory={handleViewHistory}
                            onAddTransaction={handleAddTransactionFor}
                        />

                        {assets.length === 0 && (
                            <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
                                <p className="text-gray-400 text-lg">No transactions in your portfolio yet.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                >
                                    Add Your First Transaction
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modals */}
            {showAddModal && (
                <AddAssetModal
                    onClose={handleCloseAddModal}
                    onSuccess={handleAddSuccess}
                    prefilledCoin={prefilledCoin}
                />
            )}

            {historyAsset && (
                <TransactionHistory
                    transactions={historyAsset.transactions}
                    coinSymbol={historyAsset.coin_symbol}
                    coinName={historyAsset.coin_name}
                    onClose={() => setHistoryAsset(null)}
                    onDeleteTransaction={handleDeleteTransaction}
                />
            )}
        </div>
    )
}

