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
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-black/40 border-b border-cyan-500/30">
                        <tr className="text-left text-gray-400 text-sm">
                            <th className="px-6 py-4">Asset</th>
                            <th className="px-6 py-4 text-right">Transactions</th>
                            <th className="px-6 py-4 text-right">Total Amount</th>
                            <th className="px-6 py-4 text-right">Avg Buy Price</th>
                            <th className="px-6 py-4 text-right">Current Price</th>
                            <th className="px-6 py-4 text-right">Total Invested</th>
                            <th className="px-6 py-4 text-right">Current Value</th>
                            <th className="px-6 py-4 text-right">P/L</th>
                            <th className="px-6 py-4 text-right">Return</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                        {assets.map((asset) => (
                            <tr key={asset.coin_symbol} className="hover:bg-gray-800/40 transition-all duration-200 border-l-2 border-transparent hover:border-cyan-500/50">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-semibold">{asset.coin_symbol}</div>
                                        <div className="text-sm text-gray-400">{asset.coin_name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                        {asset.transactions.length} {asset.transactions.length === 1 ? 'tx' : 'txs'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    {formatNumber(asset.totalAmount)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(asset.averageBuyPrice)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div>
                                        <div>{formatCurrency(asset.currentPrice)}</div>
                                        <div className={`text-xs ${asset.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                                            {formatPercentage(asset.change24h)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(asset.totalInvested)}
                                </td>
                                <td className="px-6 py-4 text-right font-semibold">
                                    {formatCurrency(asset.currentValue)}
                                </td>
                                <td className={`px-6 py-4 text-right font-semibold ${asset.profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                                    {formatCurrency(asset.profit)}
                                </td>
                                <td className={`px-6 py-4 text-right font-semibold ${asset.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                                    {asset.profitPercentage >= 0 ? '🟢' : '🔴'} {formatPercentage(asset.profitPercentage)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => onViewHistory(asset)}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors whitespace-nowrap"
                                            title="View transaction history"
                                        >
                                            📊 History
                                        </button>
                                        <button
                                            onClick={() => onAddTransaction(asset.coin_symbol, asset.coin_name)}
                                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
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
