'use client'

import { AggregatedAsset } from '@/types'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Props {
    assets: AggregatedAsset[]
}

const COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
]

export default function PortfolioChart({ assets }: Props) {
    const chartData = assets.map((asset, index) => ({
        name: asset.coin_symbol,
        value: asset.currentValue,
        percentage: 0, // Will be calculated
        color: COLORS[index % COLORS.length],
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

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-6">Portfolio Allocation</h2>
            <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:w-1/2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    border: '1px solid #374151',
                                    borderRadius: '0.5rem',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2">
                    <div className="space-y-3">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-750 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold">{formatCurrency(item.value)}</div>
                                    <div className="text-sm text-gray-400">{item.percentage.toFixed(2)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
