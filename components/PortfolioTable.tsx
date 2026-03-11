import { AssetWithPrice } from '@/types'

interface Props {
    assets: AssetWithPrice[]
    onEdit: (asset: AssetWithPrice) => void
    onDelete: (id: string) => void
}

export default function PortfolioTable({ assets, onEdit, onDelete }: Props) {
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
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-750">
                        <tr className="text-left text-gray-400 text-sm">
                            <th className="px-6 py-4">Asset</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-right">Buy Price</th>
                            <th className="px-6 py-4 text-right">Current Price</th>
                            <th className="px-6 py-4 text-right">Invested Value</th>
                            <th className="px-6 py-4 text-right">Current Value</th>
                            <th className="px-6 py-4 text-right">P/L</th>
                            <th className="px-6 py-4 text-right">Return</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-gray-750 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <div className="font-semibold">{asset.coin_symbol}</div>
                                        <div className="text-sm text-gray-400">{asset.coin_name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    {formatNumber(asset.amount)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(asset.buy_price)}
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
                                    {formatCurrency(asset.investedValue)}
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
                                            onClick={() => onEdit(asset)}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(asset.id)}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                                        >
                                            Delete
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
