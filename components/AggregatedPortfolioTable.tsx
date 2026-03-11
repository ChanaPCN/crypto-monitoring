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

    return (
        <div className="glass-card rounded-2xl overflow-hidden mb-8">
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
                                        <div className={`text-xs font-medium ${asset.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
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
                                <td className={`px-6 py-5 text-right font-bold ${asset.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
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
    )
}
