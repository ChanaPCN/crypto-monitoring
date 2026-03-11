'use client'

import { AggregatedAsset } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'

interface Props {
    assets: AggregatedAsset[]
}

// Coin-specific colors based on their brand colors
const getCoinColor = (symbol: string): string => {
    const coinColors: { [key: string]: string } = {
        'BTC': '#F7931A',   // Bitcoin orange
        'ETH': '#627EEA',   // Ethereum blue
        'BNB': '#F3BA2F',   // Binance yellow
        'SOL': '#9945FF',   // Solana purple
        'XRP': '#23292F',   // Ripple black/gray
        'ADA': '#0033AD',   // Cardano blue
        'DOGE': '#C2A633',  // Dogecoin gold
        'DOT': '#E6007A',   // Polkadot pink
        'MATIC': '#8247E5', // Polygon purple
        'AVAX': '#E84142',  // Avalanche red
        'LINK': '#2A5ADA',  // Chainlink blue
        'UNI': '#FF007A',   // Uniswap pink
        'LTC': '#345D9D',   // Litecoin blue
        'ATOM': '#2E3148',  // Cosmos dark
        'SHIB': '#FFA409',  // Shiba orange
    }

    return coinColors[symbol.toUpperCase()] || `hsl(${Math.random() * 360}, 70%, 60%)`
}

export default function PortfolioChart({ assets }: Props) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    // Use current value if available, otherwise use invested value
    const chartData = assets.map((asset) => ({
        name: asset.coin_symbol,
        value: asset.currentValue > 0 ? asset.currentValue : asset.totalInvested,
        percentage: 0,
        color: getCoinColor(asset.coin_symbol),
        logo: asset.logo_url,
    }))

    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

    chartData.forEach(item => {
        item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)
    }

    // If no value, don't render the chart
    if (totalValue === 0 || assets.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-8 mb-8">
                <h2 className="text-2xl font-bold mb-8 text-gray-900">
                    Portfolio Allocation
                </h2>
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">
                        No portfolio data to display
                    </div>
                    <p className="text-gray-500 text-sm mt-2">
                        Add transactions to see your portfolio allocation
                    </p>
                </div>
            </div>
        )
    }

    // Check if we're showing invested value (when prices aren't available)
    const showingInvestedValue = assets.every(a => a.currentValue === 0)

    // Calculate total current value for center display
    const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentValue, 0)
    const totalInvestedValue = assets.reduce((sum, a) => sum + a.totalInvested, 0)
    const profitLoss = totalCurrentValue - totalInvestedValue
    const profitLossPercentage = totalInvestedValue > 0 ? (profitLoss / totalInvestedValue) * 100 : 0

    // Custom center label showing total value
    const renderCenterLabel = () => {
        return (
            <g>
                <text
                    x="50%"
                    y="48%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-bold"
                    style={{ fontSize: '32px', fill: '#1d1d1f' }}
                >
                    {formatCurrency(totalValue)}
                </text>
                <text
                    x="50%"
                    y="56%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="font-medium"
                    style={{ fontSize: '14px', fill: '#86868b' }}
                >
                    Total Portfolio
                </text>
                {!showingInvestedValue && profitLoss !== 0 && (
                    <text
                        x="50%"
                        y="62%"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="font-semibold"
                        style={{
                            fontSize: '13px',
                            fill: profitLoss >= 0 ? '#34c759' : '#ff3b30'
                        }}
                    >
                        {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}% total
                    </text>
                )}
            </g>
        )
    }

    // Custom label for cleaner look
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, logo, name }: any) => {
        if (percentage < 5) return null // Don't show label for small slices

        const RADIAN = Math.PI / 180

        // Logo position - closer to center
        const logoRadius = innerRadius + (outerRadius - innerRadius) * 0.3
        const logoX = cx + logoRadius * Math.cos(-midAngle * RADIAN)
        const logoY = cy + logoRadius * Math.sin(-midAngle * RADIAN)

        // Text position - at the edge
        const textRadius = innerRadius + (outerRadius - innerRadius) * 0.75
        const textX = cx + textRadius * Math.cos(-midAngle * RADIAN)
        const textY = cy + textRadius * Math.sin(-midAngle * RADIAN)

        return (
            <g>
                {/* Logo image */}
                {logo && (
                    <foreignObject
                        x={logoX - 18}
                        y={logoY - 18}
                        width={36}
                        height={36}
                    >
                        <div
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            }}
                        >
                            <img
                                src={logo}
                                alt={name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    </foreignObject>
                )}

                {/* Percentage text */}
                <text
                    x={textX}
                    y={textY}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="15"
                    fontWeight="700"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                    {`${percentage.toFixed(0)}%`}
                </text>
            </g>
        )
    }

    return (
        <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                    Portfolio Allocation
                </h2>
                {showingInvestedValue && (
                    <p className="text-sm text-gray-500 mt-1">
                        Showing invested amounts (price data unavailable)
                    </p>
                )}
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Chart Section - Bigger and more prominent */}
                <div className="w-full lg:w-3/5 h-[500px] flex items-center justify-center -my-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {chartData.map((entry, index) => (
                                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.75} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={180}
                                paddingAngle={3}
                                dataKey="value"
                                label={renderCustomLabel}
                                labelLine={false}
                                onMouseEnter={(_, index) => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#gradient-${index})`}
                                        stroke="rgba(255, 255, 255, 0.9)"
                                        strokeWidth={3}
                                        opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.4}
                                        style={{
                                            filter: hoveredIndex === index ? 'brightness(1.1)' : 'none',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </Pie>
                            {renderCenterLabel()}
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    border: '1px solid rgb(229, 229, 234)',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                    color: 'rgb(29, 29, 31)',
                                    padding: '12px',
                                }}
                                labelStyle={{
                                    color: 'rgb(29, 29, 31)',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Asset Cards - Improved styling */}
                <div className="w-full lg:w-2/5">
                    <div className="space-y-3">
                        {chartData.map((item, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                className="group relative p-4 bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl transition-all duration-300 cursor-pointer"
                                style={{
                                    boxShadow: hoveredIndex === index
                                        ? '0 12px 32px rgba(0, 0, 0, 0.12)'
                                        : '0 2px 8px rgba(0, 0, 0, 0.04)',
                                    transform: hoveredIndex === index ? 'translateY(-2px) scale(1.02)' : 'none',
                                    borderColor: hoveredIndex === index ? item.color : 'rgb(229, 229, 234, 0.6)',
                                }}
                            >
                                {/* Color indicator bar */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
                                    style={{
                                        backgroundColor: item.color,
                                        width: hoveredIndex === index ? '4px' : '3px',
                                    }}
                                />

                                <div className="flex items-center justify-between pl-2">
                                    <div className="flex items-center gap-3">
                                        {/* Coin logo */}
                                        {item.logo && (
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center">
                                                <img
                                                    src={item.logo}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none'
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-lg text-gray-900">{item.name}</div>
                                            <div className="text-sm font-medium text-gray-500">{item.percentage.toFixed(1)}% of portfolio</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-xl text-gray-900">{formatCurrency(item.value)}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
