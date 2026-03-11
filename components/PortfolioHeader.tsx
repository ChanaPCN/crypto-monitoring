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
        <div className="mb-12">
            {/* Hero Section */}
            <div className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-3" style={{ color: 'rgb(29, 29, 31)' }}>
                    Your Crypto Portfolio
                </h1>
                <p className="text-xl text-gray-500">at a glance</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Portfolio Value */}
                <div className="glass-card glass-card-hover rounded-2xl p-6 gradient-blue">
                    <p className="text-sm font-medium text-gray-500 mb-2">Total Value</p>
                    <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(29, 29, 31)' }}>
                        {formatCurrency(summary.totalValue)}
                    </p>
                    <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${summary.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {formatPercentage(summary.change24h)}
                        </span>
                        <span className="text-xs text-gray-500">24h</span>
                    </div>
                </div>

                {/* Total Invested */}
                <div className="glass-card glass-card-hover rounded-2xl p-6 gradient-purple">
                    <p className="text-sm font-medium text-gray-500 mb-2">Invested</p>
                    <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(29, 29, 31)' }}>
                        {formatCurrency(summary.totalInvested)}
                    </p>
                    <p className="text-xs text-gray-500">Original investment</p>
                </div>

                {/* Total Profit/Loss */}
                <div className="glass-card glass-card-hover rounded-2xl p-6 gradient-green">
                    <p className="text-sm font-medium text-gray-500 mb-2">Profit/Loss</p>
                    <p className={`text-4xl font-bold mb-2 ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(summary.totalProfit)}
                    </p>
                    <p className={`text-xs font-semibold ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercentage(summary.profitPercentage)}
                    </p>
                </div>

                {/* Return */}
                <div className="glass-card glass-card-hover rounded-2xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Return</p>
                    <p className={`text-4xl font-bold mb-2 ${summary.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatPercentage(summary.profitPercentage)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {summary.totalProfit >= 0 ? 'Profit' : 'Loss'}
                    </p>
                </div>
            </div>
        </div>
    )
}
