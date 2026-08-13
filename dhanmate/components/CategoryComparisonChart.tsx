import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, Currency, Category } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryComparisonChartProps {
    transactions: Transaction[];
    currency: Currency;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, currencySymbol }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                {payload.map((pld: any) => (
                    <p key={pld.dataKey} style={{ color: pld.color }}>
                        {`${pld.name}: ${currencySymbol}${pld.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const CategoryComparisonChart: React.FC<CategoryComparisonChartProps> = ({ transactions, currency }) => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9ca3af' : '#6b7280'; // gray-400 vs gray-500
    
    const chartData = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const lastMonthExpenses = transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;
        });

        const aggregateByCategory = (expenseList: Transaction[]): Record<Category, number> => {
            return expenseList.reduce((acc, curr) => {
                acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                return acc;
            }, {} as Record<Category, number>);
        };
        
        const currentMonthTotals = aggregateByCategory(currentMonthExpenses);
        const lastMonthTotals = aggregateByCategory(lastMonthExpenses);

        const data = EXPENSE_CATEGORIES.map(category => ({
            name: category,
            'This Month': currentMonthTotals[category] || 0,
            'Last Month': lastMonthTotals[category] || 0,
        })).filter(d => d['This Month'] > 0 || d['Last Month'] > 0);

        return data;

    }, [transactions]);

    if (chartData.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No expense data for this or last month to compare.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
                margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${currency.symbol}${value/1000}k`} tick={{ fill: tickColor, fontSize: 12 }} />
                <Tooltip content={<CustomTooltip currencySymbol={currency.symbol} />} />
                <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px', color: theme === 'dark' ? '#d1d5db' : '#4b5563'}} />
                <Bar dataKey="Last Month" fill={theme === 'dark' ? '#78716c' : '#a8a29e'} />
                <Bar dataKey="This Month" fill="#10b981" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default CategoryComparisonChart;