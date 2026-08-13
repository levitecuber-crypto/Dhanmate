import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction, Currency } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface SpendingTrendsChartProps {
    transactions: Transaction[];
    currency: Currency;
}

const CustomTooltip: React.FC<any> = ({ active, payload, currencySymbol }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{dataPoint.fullDate}</p>
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{`Cumulative: ${currencySymbol}${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
            </div>
        );
    }
    return null;
};

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ transactions, currency }) => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280'; // gray-400 vs gray-500

    const chartData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of today for consistent comparison

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const expensesThisWeek = transactions.filter(t => {
            const tDate = new Date(t.date); // 'YYYY-MM-DD' is parsed as local midnight
            return t.type === 'expense' && tDate >= sevenDaysAgo && tDate <= today;
        });

        const uniqueExpenseDays = new Set(expensesThisWeek.map(t => t.date));
        if (uniqueExpenseDays.size <= 1) {
            return null; // Not enough data for a trend
        }

        const spendingByDate: { [date: string]: number } = {};
        expensesThisWeek.forEach(t => {
            spendingByDate[t.date] = (spendingByDate[t.date] || 0) + t.amount;
        });

        const data = [];
        let cumulativeAmount = 0;
        for (let i = 0; i < 7; i++) {
            const loopDate = new Date(sevenDaysAgo);
            loopDate.setDate(sevenDaysAgo.getDate() + i);
            const dateStr = loopDate.toISOString().split('T')[0];
            
            cumulativeAmount += spendingByDate[dateStr] || 0;
            
            data.push({
                day: loopDate.toLocaleDateString('en-US', { weekday: 'short' }),
                fullDate: loopDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                total: cumulativeAmount,
            });
        }
    
        return data;
    }, [transactions]);

    if (!chartData) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">Not enough expense data to display a trend for this week.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={chartData}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="day" tick={{ fill: tickColor, fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${currency.symbol}${value/1000}k`} tick={{ fill: tickColor, fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip currencySymbol={currency.symbol} />} />
                <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default SpendingTrendsChart;