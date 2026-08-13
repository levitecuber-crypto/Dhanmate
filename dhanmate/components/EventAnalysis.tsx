import React, { useMemo } from 'react';
import { Transaction, Currency } from '../types';
import SpendingChart from './SpendingChart';
import { ArrowUpIcon, ArrowDownIcon } from './icons';
import { findEventForDate } from '../data/events';

interface EventSpending {
    total: number;
    transactions: Transaction[];
}

interface YearlySpending {
    [year: string]: EventSpending;
}

interface EventAnalysisData {
    [eventName: string]: YearlySpending;
}

const EventAnalysis: React.FC<{ transactions: Transaction[], currency: Currency }> = ({ transactions, currency }) => {
    const analysisData = useMemo<EventAnalysisData>(() => {
        // FIX: The original code referenced a 'tag' property that does not exist on the Transaction type.
        // The logic is updated to dynamically associate transactions with cultural events based on their date.
        const data: EventAnalysisData = {};

        transactions.forEach(t => {
            if (t.type === 'expense') {
                const event = findEventForDate(t.date);
                if (event) {
                    const year = new Date(t.date).getFullYear().toString();
                    const tag = event.name;

                    if (!data[tag]) data[tag] = {};
                    if (!data[tag][year]) data[tag][year] = { total: 0, transactions: [] };

                    data[tag][year].total += t.amount;
                    data[tag][year].transactions.push(t);
                }
            }
        });
        return data;
    }, [transactions]);

    const currentYear = new Date().getFullYear().toString();
    const previousYear = (parseInt(currentYear) - 1).toString();

    const eventsToShow = Object.keys(analysisData)
        .filter(eventName => analysisData[eventName][currentYear])
        .sort();

    if (eventsToShow.length === 0) {
        return null; // Don't render if there's no tagged spending this year
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-200">Seasonal Spending Analysis</h3>
            <div className="space-y-6">
                {eventsToShow.map(eventName => {
                    const currentYearData = analysisData[eventName][currentYear];
                    const previousYearData = analysisData[eventName][previousYear];
                    let comparisonText = <p className="text-sm text-gray-500 dark:text-gray-400">No data from last year for comparison.</p>;
                    if (previousYearData && previousYearData.total > 0) {
                        const difference = currentYearData.total - previousYearData.total;
                        const percentageChange = (difference / previousYearData.total) * 100;
                        const isIncrease = difference > 0;
                        comparisonText = (
                            <div className={`flex items-center text-sm font-semibold ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                                {isIncrease ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                                <span>{Math.abs(percentageChange).toFixed(0)}%</span>
                                <span className="font-normal text-gray-500 dark:text-gray-400 ml-1"> {isIncrease ? 'more' : 'less'} than last year ({currency.symbol}{previousYearData.total.toLocaleString()})</span>
                            </div>
                        );
                    }

                    return (
                        <div key={eventName} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h4 className="font-bold text-lg text-gray-700 dark:text-gray-300">{eventName} Spending ({currentYear})</h4>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{currency.symbol}{currentYearData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            {comparisonText}
                            <div className="h-64 mt-4">
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 text-center">Category Breakdown</p>
                                <SpendingChart transactions={currentYearData.transactions} currency={currency} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EventAnalysis;