import { AggregatedAsset } from '@/types'

interface Props {
    assets: AggregatedAsset[]
    onViewHistory: (asset: AggregatedAsset) => void
    onAddTransaction: (coinSymbol: string, coinName: string) => void
}

export default function AggregatedPortfolioTable({ assets, onViewHistory, onAddTransaction }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const formatNumber = (value: number, decimals: number = 8) => {
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: decimals,
        })
    }

    const formatPercentage = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
    }

    const renderTriangle = (value: number) => {
        if (value >= 0) {
            return <span className="text-profit">▲</span>
        }
        return <span className="text-loss">▼</span>
    }

    return (
        <>
            {/* Mobile Card View - Apple-style */}
            <div className="sm:hidden space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 px-1 mb-4" style={{ letterSpacing: '-0.01em' }}>Holdings</h3>
                {assets.map((asset) => (
                    <div key={asset.coin_symbol} className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 space-y-4 border border-gray-200/40 shadow-sm">
                        {/* Header with logo and name */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {asset.logo_url ? (
                                    <img
                                        src={asset.logo_url}
                                        alt={asset.coin_name}
                                        className="w-11 h-11 rounded-full shadow-sm"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                        }}
                                    />
                                ) : (
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white font-semibold shadow-sm text-lg">
                                        {asset.coin_symbol.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-lg text-gray-900" style={{ letterSpacing: '-0.01em' }}>{asset.coin_symbol}</div>
                                    <div className="text-xs text-gray-400 font-medium">{asset.coin_name}</div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100/80 text-gray-500 mt-1">
                                        {asset.transactions.length} tx
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Holdings */}
                        <div className="bg-gray-50/30 rounded-xl p-3 space-y-2 border border-gray-100/50">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-400">Holdings</span>
                                <span className="font-semibold text-sm text-gray-900">{formatNumber(asset.totalAmount, 4)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-400">Avg Buy</span>
                                <span className="font-semibold text-sm text-gray-700">{formatCurrency(asset.averageBuyPrice)}</span>
                            </div>
                        </div>

                        {/* Price Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-xs font-medium text-gray-400 mb-1.5">Current Price</div>
                                <div className="font-semibold text-base text-gray-900" style={{ letterSpacing: '-0.01em' }}>{formatCurrency(asset.currentPrice)}</div>
                                <div className={`text-xs font-medium mt-0.5 flex items-center gap-0.5 ${asset.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                                    {renderTriangle(asset.change24h)}
                                    {formatPercentage(asset.change24h)} 24h
                                </div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-400 mb-1.5">Invested</div>
                                <div className="font-semibold text-base text-gray-700" style={{ letterSpacing: '-0.01em' }}>{formatCurrency(asset.totalInvested)}</div>
                            </div>
                        </div>

                        {/* Value and Profit */}
                        <div className="border-t border-gray-200/50 pt-3 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-400">Current Value</span>
                                <span className="font-semibold text-lg text-gray-900" style={{ letterSpacing: '-0.01em' }}>{formatCurrency(asset.currentValue)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-400">Profit/Loss</span>
                                <div className="text-right">
                                    <div className={`font-semibold text-base ${asset.profit >= 0 ? 'text-profit' : 'text-loss'}`} style={{ letterSpacing: '-0.01em' }}>
                                        {formatCurrency(asset.profit)}
                                    </div>
                                    <div className={`text-xs font-medium flex items-center gap-0.5 ${asset.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                                        {renderTriangle(asset.profitPercentage)}
                                        {formatPercentage(asset.profitPercentage)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                            <button
                                onClick={() => onViewHistory(asset)}
                                className="flex-1 px-4 py-2.5 bg-white/80 border border-gray-200/60 hover:border-gray-300 text-gray-700 rounded-xl text-sm font-medium apple-transition shadow-sm hover:shadow active:scale-95"
                            >
                                History
                            </button>
                            <button
                                onClick={() => onAddTransaction(asset.coin_symbol, asset.coin_name)}
                                className="flex-1 px-4 py-2.5 bg-apple-blue text-white rounded-xl text-sm font-medium apple-transition hover:opacity-90 shadow-sm active:scale-95"
                            >
                                + Buy
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block glass-card rounded-2xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                            <tr className="text-left text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">Asset</th>
                                <th className="px-6 py-4 text-right">Transactions</th>
                                <th className="px-6 py-4 text-right">Holdings</th>
                                <th className="px-6 py-4 text-right">Avg Buy</th>
                                <th className="px-6 py-4 text-right">Current</th>
                                <th className="px-6 py-4 text-right">Invested</th>
                                <th className="px-6 py-4 text-right">Value</th>
                                <th className="px-6 py-4 text-right">P/L</th>
                                <th className="px-6 py-4 text-right">Return</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {assets.map((asset) => (
                                <tr key={asset.coin_symbol} className="apple-transition hover:bg-gray-50/50 group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            {asset.logo_url ? (
                                                <img
                                                    src={asset.logo_url}
                                                    alt={asset.coin_name}
                                                    className="w-10 h-10 rounded-full shadow-soft"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-apple-blue to-apple-purple flex items-center justify-center text-white font-bold shadow-soft">
                                                    {asset.coin_symbol.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-semibold text-gray-900">{asset.coin_symbol}</div>
                                                <div className="text-sm text-gray-500">{asset.coin_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                            {asset.transactions.length}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right font-medium text-gray-900">
                                        {formatNumber(asset.totalAmount, 4)}
                                    </td>
                                    <td className="px-6 py-5 text-right text-gray-700">
                                        {formatCurrency(asset.averageBuyPrice)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div>
                                            <div className="font-semibold text-gray-900">{formatCurrency(asset.currentPrice)}</div>
                                            <div className={`text-xs font-medium flex items-center gap-0.5 ${asset.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                                                {renderTriangle(asset.change24h)}
                                                {formatPercentage(asset.change24h)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right text-gray-700">
                                        {formatCurrency(asset.totalInvested)}
                                    </td>
                                    <td className="px-6 py-5 text-right font-semibold text-gray-900">
                                        {formatCurrency(asset.currentValue)}
                                    </td>
                                    <td className={`px-6 py-5 text-right font-semibold ${asset.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                                        {formatCurrency(asset.profit)}
                                    </td>
                                    <td className={`px-6 py-5 text-right font-bold flex items-center justify-end gap-1 ${asset.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                                        {renderTriangle(asset.profitPercentage)}
                                        {formatPercentage(asset.profitPercentage)}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => onViewHistory(asset)}
                                                className="px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg text-sm font-medium apple-transition shadow-soft hover:shadow-medium"
                                                title="View transaction history"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => onAddTransaction(asset.coin_symbol, asset.coin_name)}
                                                className="px-3 py-1.5 bg-apple-blue text-white rounded-lg text-sm font-medium apple-transition hover:opacity-90 shadow-soft"
                                                title="Add another transaction"
                                            >
                                                + Buy
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}
