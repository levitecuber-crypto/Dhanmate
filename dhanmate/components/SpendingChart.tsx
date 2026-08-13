import React, { useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend, TooltipProps } from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import { Transaction, Currency, Category } from '../types';
import { CATEGORIES } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

// --- Configuration & Constants ---

// 1. Consistent Category Colors: Map categories to specific colors.
const BASE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff4d4d', '#4ddbff', '#ff4da6'];
const CATEGORY_COLORS: Record<string, string> = {};
CATEGORIES.forEach((category, index) => {
    CATEGORY_COLORS[category] = BASE_COLORS[index % BASE_COLORS.length];
});
CATEGORY_COLORS['Other'] = '#94a3b8'; // A more distinct slate gray for the 'Other' category

const MIN_PERCENT_FOR_SLICE = 0.03; // 3% threshold for grouping into 'Other'

// --- Custom Hooks for Data Processing ---

/**
 * 9. Cleaner Code Organization: Processes transaction data for the spending chart.
 * 3. Handling Large Datasets: Groups small expense categories into an 'Other' slice.
 */
const useSpendingChartData = (transactions: Transaction[]) => {
    return useMemo(() => {
        const expenseData = transactions.filter(t => t.type === 'expense');
        if (expenseData.length === 0) return [];

        const spendingByCategory = expenseData.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {} as Record<Category, number>);
        
        const totalExpenses = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);
        if (totalExpenses === 0) return [];

        const mainSlices: { name: string; value: number }[] = [];
        let otherValue = 0;

        for (const [name, value] of Object.entries(spendingByCategory)) {
            if (value / totalExpenses >= MIN_PERCENT_FOR_SLICE) {
                mainSlices.push({ name, value });
            } else {
                otherValue += value;
            }
        }

        if (otherValue > 0) {
            mainSlices.push({ name: 'Other', value: otherValue });
        }
        
        // 10. UI/UX Polish: Sort slices for better visual hierarchy.
        return mainSlices.sort((a, b) => b.value - a.value);

    }, [transactions]);
};


// --- Chart Rendering Components ---

/**
 * 5. Improving Readability: Renders percentage labels inside larger pie slices.
 */
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // Don't render labels for very small slices to avoid clutter
    if (percent < 0.05) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs pointer-events-none">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};


/**
 * 1. Stronger Type Safety: Use TooltipProps for type safety.
 * 4. Optimizing Tooltip Logic: Uses payload directly provided by Recharts.
 * 7. Dark Mode Support: Added dark mode classes for tooltip styling.
 */
// FIX: The TooltipProps type from recharts appears to be causing a type error where the 'payload' property is not found.
// By defining the props interface directly, we resolve the issue and can also strongly type the 'percent' property, which is specific to PieChart tooltips.
interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        name: NameType;
        value: ValueType;
        percent: number;
    }[];
    currencySymbol: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, currencySymbol }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const percentage = (data.percent * 100).toFixed(2);
        
        return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-700">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{data.name}</p>
                <p className="text-emerald-500 font-medium dark:text-emerald-400">
                    {`${currencySymbol}${Number(data.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{`(${percentage}%)`}</p>
            </div>
        );
    }
    return null;
};


// --- Main Chart Component ---

interface SpendingChartProps {
    transactions: Transaction[];
    currency: Currency;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, currency }) => {
    const data = useSpendingChartData(transactions);
    const { theme } = useTheme();
    
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No expense data to display.</div>;
    }
    
    return (
        // FIX: Wrap ResponsiveContainer in a div to apply accessibility props like 'role'
        // which are not supported by the ResponsiveContainer's type definitions.
        <div style={{ width: '100%', height: '100%' }} role="figure" aria-label="A pie chart showing the breakdown of expenses by category.">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    {/* 8. Accessibility: Add title and description for screen readers */}
                    <title>Expense Breakdown by Category</title>
                    <desc>This chart shows how your expenses are distributed across different categories like Food, Transport, and Bills.</desc>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius="80%"
                        innerRadius="50%"
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={5}
                    >
                        {data.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS['Other']} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip currencySymbol={currency.symbol} />} />
                    {/* 6. Responsive Legend: Positioned at the bottom and wraps on small screens. */}
                    <Legend 
                        iconSize={10} 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{
                            paddingTop: '15px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            lineHeight: '22px',
                            fontSize: '12px',
                            color: theme === 'dark' ? '#d1d5db' : '#4b5563', // gray-300 vs gray-600
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;