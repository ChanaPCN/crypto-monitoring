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
    const [refreshing, setRefreshing] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [historyAsset, setHistoryAsset] = useState<AggregatedAsset | null>(null)
    const [prefilledCoin, setPrefilledCoin] = useState<{ symbol: string; name: string } | null>(null)
    const [refreshKey, setRefreshKey] = useState(0)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [pricesStale, setPricesStale] = useState(false)

    useEffect(() => {
        checkUser()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (user) {
            // Silent refresh if it's triggered by refreshKey (auto or manual)
            const isRefresh = refreshKey > 0
            loadPortfolio(isRefresh)

            // Auto-refresh every 15 seconds for faster price updates
            const interval = setInterval(() => {
                setRefreshKey(prev => prev + 1)
            }, 15000) // Reduced from 30s to 15s

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

    const loadPortfolio = async (silentRefresh = false) => {
        try {
            if (silentRefresh) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }

            // Fetch transactions from new transactions table
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .order('buy_date', { ascending: false })

            // Fetch old portfolio entries (for backward compatibility)
            const { data: portfolioData, error: portfolioError } = await supabase
                .from('portfolio')
                .select('*')
                .order('buy_date', { ascending: false })

            // Combine both sources
            let allTransactions: Transaction[] = []

            // Add new transactions
            if (transactionsData && !transactionsError) {
                allTransactions = [...transactionsData]
            }

            // Convert old portfolio entries to transaction format
            if (portfolioData && !portfolioError) {
                const convertedTransactions: Transaction[] = portfolioData.map((item: any) => ({
                    id: item.id,
                    user_id: item.user_id,
                    coin_symbol: item.coin_symbol,
                    coin_name: item.coin_name,
                    amount: item.amount,
                    buy_price: item.buy_price,
                    buy_date: item.buy_date,
                    notes: '(Migrated from old portfolio)',
                    created_at: item.created_at,
                }))
                allTransactions = [...allTransactions, ...convertedTransactions]
            }

            if (allTransactions.length === 0) {
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
            allTransactions.forEach((tx: Transaction) => {
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

            // Check if we got valid prices
            const hasPrices = prices && Object.keys(prices).length > 0
            setPricesStale(!hasPrices)

            // Calculate aggregated assets
            const aggregatedAssets: AggregatedAsset[] = Object.entries(groupedTransactions).map(
                ([symbol, txs]) => {
                    const coinId = symbolToCoinGeckoId(symbol)
                    const priceData = prices[coinId]

                    // Keep existing price if new fetch failed (prevents showing $0)
                    const existingAsset = assets.find(a => a.coin_symbol === symbol)
                    const currentPrice = priceData?.usd || existingAsset?.currentPrice || 0
                    const change24h = priceData?.usd_24h_change || existingAsset?.change24h || 0

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
                        coin_id: txs[0].coin_id,
                        logo_url: txs[0].logo_url,
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

            // Update last updated timestamp
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Error loading portfolio:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
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
        try {
            // First, try to delete from transactions table
            const { error: txError } = await supabase
                .from('transactions')
                .delete()
                .eq('id', transactionId)

            // If not found in transactions, try portfolio table (backward compatibility)
            if (txError) {
                const { error: portfolioError } = await supabase
                    .from('portfolio')
                    .delete()
                    .eq('id', transactionId)

                if (portfolioError) {
                    console.error('Error deleting transaction:', portfolioError)
                    alert('Failed to delete transaction')
                    return
                }
            }

            // Refresh the portfolio after successful deletion
            await loadPortfolio(true)
        } catch (error) {
            console.error('Error deleting transaction:', error)
            alert('Failed to delete transaction')
        }
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
        loadPortfolio(true)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Top Navigation - Mobile Optimized */}
            <nav className="sticky top-0 z-50 glass-card border-b border-gray-200/80">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 max-w-7xl">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white font-bold shadow-medium">
                                ₿
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Portfolio</h2>
                                <p className="text-xs text-gray-500 hidden sm:block">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={() => setRefreshKey(prev => prev + 1)}
                                className={`w-9 h-9 sm:w-auto sm:px-4 sm:py-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg apple-transition shadow-soft hover:shadow-medium font-medium flex items-center justify-center gap-2 ${refreshing ? 'opacity-75 cursor-wait' : ''}`}
                                title={lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Refresh prices'}
                                disabled={refreshing}
                            >
                                <span className={refreshing ? 'inline-block animate-spin' : ''}>↻</span>
                                <span className="hidden sm:inline text-sm">
                                    {refreshing ? 'Updating...' : 'Refresh'}
                                </span>
                            </button>
                            {lastUpdated && (
                                <div className={`hidden lg:flex items-center px-3 py-2 rounded-lg text-xs ${pricesStale ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${pricesStale ? 'bg-yellow-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></span>
                                    {pricesStale ? 'Using cached prices' : `Updated ${new Date().getTime() - lastUpdated.getTime() < 60000
                                        ? 'just now'
                                        : `${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000)}m ago`}`}
                                </div>
                            )}
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="hidden sm:flex px-4 py-2 bg-apple-blue text-white rounded-lg apple-transition hover:opacity-90 shadow-soft font-medium"
                            >
                                + Add
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-3 sm:px-4 py-2 bg-white border border-gray-300 hover:border-red-400 text-gray-700 hover:text-red-600 rounded-lg apple-transition shadow-soft font-medium text-sm"
                            >
                                <span className="hidden sm:inline">Logout</span>
                                <span className="sm:hidden">Exit</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Price Status Warning Banner */}
            {pricesStale && !loading && (
                <div className="bg-yellow-50 border-b border-yellow-200">
                    <div className="container mx-auto px-4 sm:px-6 py-3 max-w-7xl">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm">
                            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Using cached prices - API temporarily unavailable. Prices may be outdated.</span>
                            <button
                                onClick={() => setRefreshKey(prev => prev + 1)}
                                className="ml-auto px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs font-medium transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl pb-24 sm:pb-8">{" "}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-apple-blue"></div>
                        <p className="mt-4 text-gray-500">Loading your portfolio...</p>
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
                            <div className="text-center py-20 glass-card rounded-2xl">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl">
                                    ₿
                                </div>
                                <p className="text-gray-600 text-lg mb-6">No transactions in your portfolio yet.</p>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="px-6 py-3 bg-apple-blue text-white rounded-lg apple-transition hover:opacity-90 shadow-medium font-semibold"
                                >
                                    Add Your First Transaction
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Floating Action Button (Mobile) - Lighter Apple-style */}
            <button
                onClick={() => setShowAddModal(true)}
                className="sm:hidden fixed bottom-6 right-5 w-14 h-14 bg-gradient-to-br from-apple-blue to-apple-purple text-white rounded-full shadow-lg hover:shadow-xl apple-transition flex items-center justify-center z-50 font-semibold text-2xl active:scale-95"
                style={{ boxShadow: '0 8px 20px rgba(0, 122, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.12)' }}
                aria-label="Add transaction"
            >
                +
            </button>

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

