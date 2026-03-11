import { PortfolioSummary } from '@/types'

interface Props {
    summary: PortfolioSummary
}

export default function PortfolioHeader({ summary }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    const formatPercentage = (value: number) => {
        return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Portfolio Value */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300">
                <p className="text-gray-400 text-sm mb-2">Total Portfolio Value</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalValue)}</p>
                <p className={`text-sm mt-2 ${summary.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatPercentage(summary.change24h)} (24h)
                </p>
            </div>

            {/* Total Invested */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
                <p className="text-gray-400 text-sm mb-2">Total Invested</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalInvested)}</p>
                <p className="text-sm mt-2 text-gray-500">Original investment</p>
            </div>

            {/* Total Profit/Loss */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-pink-500/30 hover:border-pink-500/60 transition-all duration-300">
                <p className="text-gray-400 text-sm mb-2">Total Profit/Loss</p>
                <p className={`text-3xl font-bold ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatCurrency(summary.totalProfit)}
                </p>
                <p className={`text-sm mt-2 ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {summary.totalProfit >= 0 ? '🟢' : '🔴'} {formatPercentage(summary.profitPercentage)}
                </p>
            </div>

            {/* Return */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300">
                <p className="text-gray-400 text-sm mb-2">Return</p>
                <p className={`text-3xl font-bold ${summary.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {formatPercentage(summary.profitPercentage)}
                </p>
                <p className="text-sm mt-2 text-gray-500">
                    {summary.totalProfit >= 0 ? 'Profit' : 'Loss'}
                </p>
            </div>
        </div>
    )
}
