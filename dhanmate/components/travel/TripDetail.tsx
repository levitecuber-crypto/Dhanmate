import React, { useState } from 'react';
import { Trip, Currency, TripExpense } from '../../types';
import { ArrowLeftIcon, WalletIcon, getCategoryIcon } from '../icons';
import SpendingChart from '../SpendingChart';

interface TripDetailProps {
    trip: Trip;
    currency: Currency;
    onEndTrip: (tripId: string) => void;
    onBack: () => void;
}

const TripExpenseRow: React.FC<{ expense: TripExpense, currency: Currency }> = ({ expense, currency }) => (
    <li className="flex items-center justify-between py-3">
        <div className="flex items-center space-x-4">
            <span className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                {getCategoryIcon(expense.category, "h-5 w-5 text-gray-600 dark:text-gray-300")}
            </span>
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{expense.description}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>&bull;</span>
                    <span>{expense.category}</span>
                </div>
            </div>
        </div>
        <p className="font-bold text-base text-gray-800 dark:text-gray-200">
            -{currency.symbol}{expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
    </li>
);

const StatCard: React.FC<{ title: string; amount: number; currencySymbol: string; color: string; }> = ({ title, amount, currencySymbol, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{currencySymbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
    </div>
);


const TripDetail: React.FC<TripDetailProps> = ({ trip, currency, onEndTrip, onBack }) => {
    const [splitCount, setSplitCount] = useState('2');
    const [splitResult, setSplitResult] = useState<number | null>(null);

    const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remainingBudget = trip.totalBudget - totalSpent;
    const isOverBudget = remainingBudget < 0;

    const chartTransactions = trip.expenses.map(e => ({ ...e, type: 'expense' as 'expense' }));
    
    const handleEndTripClick = () => {
        if (window.confirm(`Are you sure you want to end the trip "${trip.name}"? This will move it to your completed trips.`)) {
            onEndTrip(trip.id);
        }
    };

    const handleSplitCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSplitCount(e.target.value);
        setSplitResult(null); // Reset result when input changes
    };

    const handleCalculateSplit = () => {
        const count = parseInt(splitCount);
        if (count > 0 && totalSpent >= 0) {
            setSplitResult(totalSpent / count);
        } else {
            setSplitResult(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 mr-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{trip.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{trip.destination}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Total Budget" amount={trip.totalBudget} currencySymbol={currency.symbol} color="text-gray-800 dark:text-gray-200" />
                <StatCard title="Total Spent" amount={totalSpent} currencySymbol={currency.symbol} color="text-gray-800 dark:text-gray-200" />
                <StatCard title={isOverBudget ? "Overspent By" : "Budget Remaining"} amount={Math.abs(remainingBudget)} currencySymbol={currency.symbol} color={isOverBudget ? 'text-red-500' : 'text-green-500'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-200">Trip Expenses</h3>
                    {trip.expenses.length > 0 ? (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                           {trip.expenses.map(expense => <TripExpenseRow key={expense.id} expense={expense} currency={currency} />)}
                        </ul>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">No expenses logged for this trip yet.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 h-[350px]">
                        <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-gray-200 text-center">Expense Breakdown</h3>
                        <SpendingChart transactions={chartTransactions} currency={currency} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-4">Split Trip Expenses</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="split-count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of People</label>
                                <input
                                    type="number"
                                    id="split-count"
                                    value={splitCount}
                                    onChange={handleSplitCountChange}
                                    min="1"
                                    placeholder="e.g., 2"
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <button
                                onClick={handleCalculateSplit}
                                disabled={!splitCount || parseInt(splitCount) <= 0}
                                className="w-full bg-emerald-500 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 dark:disabled:bg-emerald-800"
                            >
                                Divide the expenses
                            </button>
                            {splitResult !== null && (
                                <div className="text-center pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-600 dark:text-gray-300">Each person pays:</p>
                                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {currency.symbol}{splitResult.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                     {trip.status === 'active' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                           <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Manage Trip</h3>
                           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">Once your adventure is over, end the trip to get a summary and move it to your history.</p>
                            <button onClick={handleEndTripClick} className="w-full bg-red-500 text-white font-semibold py-2.5 rounded-lg hover:bg-red-600 transition-colors">
                                End Trip
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TripDetail;