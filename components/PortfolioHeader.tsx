import { PortfolioSummary } from '@/types'

interface Props {
    summary: PortfolioSummary
}

export default function PortfolioHeader({ summary }: Props) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
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
        <div className="mb-6 sm:mb-12">
            {/* Hero Section - Apple-style Mobile */}
            <div className="text-center mb-8 sm:mb-8 px-4">
                {/* Mobile: Refined total value */}
                <div className="sm:hidden mb-6">
                    <p className="text-xs font-medium text-gray-400 mb-3 tracking-wide uppercase">Total Portfolio</p>
                    <h1 className="text-4xl font-semibold tracking-tight mb-2" style={{ color: 'rgb(29, 29, 31)', letterSpacing: '-0.02em' }}>
                        {formatCurrency(summary.totalValue)}
                    </h1>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-sm font-medium flex items-center gap-1 ${summary.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {renderTriangle(summary.profitPercentage)}
                            {formatPercentage(summary.profitPercentage)}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className={`text-sm font-medium ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {formatCurrency(summary.totalProfit)}
                        </span>
                    </div>
                </div>

                {/* Desktop: Original design */}
                <div className="hidden sm:block">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3" style={{ color: 'rgb(29, 29, 31)' }}>
                        Your Crypto Portfolio
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-500">at a glance</p>
                </div>
            </div>

            {/* Stats Grid - Apple-style compact cards */}
            <div className="sm:hidden mb-4">
                <div className="overflow-x-auto -mx-4 px-4 pb-3 scrollbar-hide">
                    <div className="flex gap-2.5 min-w-max">
                        {/* Total Portfolio Value */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3.5 border border-gray-200/40 min-w-[160px] flex-shrink-0 shadow-sm">
                            <p className="text-xs font-medium text-gray-400 mb-2">Total Value</p>
                            <p className="text-2xl font-semibold mb-0.5" style={{ color: 'rgb(29, 29, 31)', letterSpacing: '-0.01em' }}>
                                {formatCurrency(summary.totalValue)}
                            </p>
                            <div className="flex items-center gap-1">
                                <span className={`text-xs font-medium flex items-center gap-0.5 ${summary.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                                    {renderTriangle(summary.change24h)}
                                    {formatPercentage(summary.change24h)}
                                </span>
                                <span className="text-xs text-gray-400">24h</span>
                            </div>
                        </div>

                        {/* Total Invested */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3.5 border border-gray-200/40 min-w-[160px] flex-shrink-0 shadow-sm">
                            <p className="text-xs font-medium text-gray-400 mb-2">Invested</p>
                            <p className="text-2xl font-semibold" style={{ color: 'rgb(29, 29, 31)', letterSpacing: '-0.01em' }}>
                                {formatCurrency(summary.totalInvested)}
                            </p>
                        </div>

                        {/* Total Profit/Loss */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3.5 border border-gray-200/40 min-w-[160px] flex-shrink-0 shadow-sm">
                            <p className="text-xs font-medium text-gray-400 mb-2">Profit/Loss</p>
                            <p className={`text-2xl font-semibold mb-0.5 ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`} style={{ letterSpacing: '-0.01em' }}>
                                {formatCurrency(summary.totalProfit)}
                            </p>
                            <p className={`text-xs font-medium flex items-center gap-0.5 ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                                {renderTriangle(summary.profitPercentage)}
                                {formatPercentage(summary.profitPercentage)}
                            </p>
                        </div>

                        {/* Return */}
                        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-3.5 border border-gray-200/40 min-w-[160px] flex-shrink-0 shadow-sm">
                            <p className="text-xs font-medium text-gray-400 mb-2">Return</p>
                            <p className={`text-2xl font-semibold flex items-center gap-1 ${summary.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`} style={{ letterSpacing: '-0.01em' }}>
                                {renderTriangle(summary.profitPercentage)}
                                {formatPercentage(summary.profitPercentage)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{/* Total Portfolio Value */}
                <div className="glass-card glass-card-hover rounded-2xl p-6 gradient-blue">
                    <p className="text-sm font-medium text-gray-500 mb-2">Total Value</p>
                    <p className="text-4xl font-bold mb-2" style={{ color: 'rgb(29, 29, 31)' }}>
                        {formatCurrency(summary.totalValue)}
                    </p>
                    <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold flex items-center gap-0.5 ${summary.change24h >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {renderTriangle(summary.change24h)}
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
                    <p className={`text-xs font-semibold flex items-center gap-0.5 ${summary.totalProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {renderTriangle(summary.profitPercentage)}
                        {formatPercentage(summary.profitPercentage)}
                    </p>
                </div>

                {/* Return */}
                <div className="glass-card glass-card-hover rounded-2xl p-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Return</p>
                    <p className={`text-4xl font-bold mb-2 flex items-center gap-1.5 ${summary.profitPercentage >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {renderTriangle(summary.profitPercentage)}
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
