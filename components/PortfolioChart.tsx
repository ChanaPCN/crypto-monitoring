'use client'

import { AggregatedAsset } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'

interface Props {
    assets: AggregatedAsset[]
}

// Coin-specific colors based on their brand colors - Softer for premium Apple look
const getCoinColor = (symbol: string): string => {
    const coinColors: { [key: string]: string } = {
        'BTC': '#F6B55C',   // Bitcoin orange - softer
        'ETH': '#8FA2FF',   // Ethereum blue - softer
        'BNB': '#F5C95A',   // Binance yellow - softer
        'SOL': '#B47AFF',   // Solana purple - softer
        'XRP': '#52595F',   // Ripple gray - softer
        'ADA': '#3366CC',   // Cardano blue - softer
        'DOGE': '#E2C868',  // Dogecoin gold - softer
        'DOT': '#F04FA0',   // Polkadot pink - softer
        'MATIC': '#9F6BF0', // Polygon purple - softer
        'AVAX': '#ED6A6B',  // Avalanche red - softer
        'LINK': '#5A8AE8',  // Chainlink blue - softer
        'UNI': '#FF4D9F',   // Uniswap pink - softer
        'LTC': '#5C82B8',   // Litecoin blue - softer
        'ATOM': '#52586F',  // Cosmos dark - softer
        'SHIB': '#FFB84D',  // Shiba orange - softer
    }

    return coinColors[symbol.toUpperCase()] || `hsl(${Math.random() * 360}, 65%, 65%)`
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
                    className="font-semibold"
                    style={{ fontSize: '24px', fill: '#1d1d1f', letterSpacing: '-0.02em' }}
                >
                    {formatCurrency(totalValue)}
                </text>
                {!showingInvestedValue && profitLoss !== 0 && (
                    <>
                        <text
                            x="50%"
                            y="56%"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="font-medium"
                            style={{
                                fontSize: '13px',
                                fill: profitLoss >= 0 ? '#34c759' : '#ff3b30'
                            }}
                        >
                            {profitLoss >= 0 ? '▲' : '▼'} {profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(1)}%
                        </text>
                    </>
                )}
            </g>
        )
    }

    // Custom label for cleaner look
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, logo, name }: any) => {
        // Don't show any labels on mobile for cleaner look
        return null
    }

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 mb-5 sm:mb-8 border border-gray-200/40 shadow-sm">
            <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.01em' }}>
                    Portfolio Allocation
                </h2>
                {showingInvestedValue && (
                    <p className="text-xs text-gray-400 mt-1">
                        Showing invested amounts
                    </p>
                )}
            </div>
            <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6">
                {/* Chart Section - Full width on mobile */}
                <div className="w-full lg:w-3/5 h-[240px] sm:h-[500px] flex items-center justify-center">
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
                                innerRadius={65}
                                outerRadius={90}
                                paddingAngle={2}
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
                                        stroke="rgba(255, 255, 255, 0.95)"
                                        strokeWidth={2}
                                        opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.5}
                                        style={{
                                            filter: hoveredIndex === index ? 'brightness(1.05)' : 'none',
                                            transition: 'all 0.2s ease',
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

                {/* Asset Cards - Lighter Apple-style */}
                <div className="w-full lg:w-2/5">
                    <div className="space-y-2">
                        {chartData.map((item, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onTouchStart={() => setHoveredIndex(index)}
                                className="group relative p-2.5 bg-white/60 backdrop-blur-xl border rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
                                style={{
                                    boxShadow: hoveredIndex === index
                                        ? '0 4px 12px rgba(0, 0, 0, 0.08)'
                                        : '0 1px 3px rgba(0, 0, 0, 0.04)',
                                    borderColor: hoveredIndex === index ? item.color : 'rgba(229, 229, 234, 0.4)',
                                    borderWidth: '1px',
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {/* Coin logo */}
                                        {item.logo && (
                                            <div className="w-7 h-7 rounded-full overflow-hidden bg-white shadow-sm flex items-center justify-center flex-shrink-0">
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
                                        <div className="min-w-0">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-semibold text-sm text-gray-900">{item.name}</span>
                                                <span className="text-xs font-medium text-gray-400">{item.percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-semibold text-sm text-gray-900" style={{ letterSpacing: '-0.01em' }}>{formatCurrency(item.value)}</div>
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
