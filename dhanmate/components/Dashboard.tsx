import React, { useState, useMemo } from 'react';
import { Currency, Transaction, RecurringTransaction } from '../types';
import { ArrowUpIcon, ArrowDownIcon, WalletIcon, EditIcon } from './icons';
import SpendingChart from './SpendingChart';
import SpendingTrendsChart from './SpendingTrendsChart';
import CategoryComparisonChart from './CategoryComparisonChart';
import TransactionList from './TransactionList';
import RecurringTransactions from './RecurringTransactions';

interface DashboardProps {
    summary: {
        income: number;
        expenses: number;
        balance: number;
    };
    budgetSummary: {
        totalBudget: number;
        expensesThisMonth: number;
        budgetRemaining: number;
    };
    currency: Currency;
    transactions: Transaction[];
    onEditTransaction: (transaction: Transaction) => void;
    onDeleteTransaction: (transactionId: string) => void;
    recurringTransactions: RecurringTransaction[];
    onDeleteRecurringTransaction: (rtId: string) => void;
    onEditRecurringTransaction: (rt: RecurringTransaction | 'new') => void;
    onNavigateToBudget: () => void;
    onEditOverallBudget: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    summary, 
    budgetSummary, 
    currency, 
    transactions, 
    onEditTransaction, 
    onDeleteTransaction,
    recurringTransactions,
    onEditRecurringTransaction,
    onDeleteRecurringTransaction,
    onNavigateToBudget,
    onEditOverallBudget
}) => {
    
    return (
        <div className="max-w-7xl mx-auto pb-24 space-y-6">
            <DashboardGraphs 
                summary={summary}
                budgetSummary={budgetSummary}
                currency={currency} 
                transactions={transactions}
                onNavigateToBudget={onNavigateToBudget}
                onEditOverallBudget={onEditOverallBudget}
            />
            <TransactionList 
                transactions={transactions} 
                currency={currency}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
            />
             <RecurringTransactions
                recurringTransactions={recurringTransactions}
                onEdit={onEditRecurringTransaction}
                onDelete={onDeleteRecurringTransaction}
                currency={currency}
            />
        </div>
    );
};

// Sub-component for the graph section to keep logic clean
const DashboardGraphs: React.FC<Pick<DashboardProps, 'summary' | 'budgetSummary' | 'currency' | 'transactions' | 'onNavigateToBudget' | 'onEditOverallBudget'>> = ({ summary, budgetSummary, currency, transactions, onNavigateToBudget, onEditOverallBudget }) => {
    type Tab = 'overview' | 'trends' | 'comparison';
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const renderContent = () => {
        // ... (rest of the renderContent logic remains the same)
        switch(activeTab) {
            case 'overview': {
                const { totalBudget, expensesThisMonth, budgetRemaining } = budgetSummary;
                const progress = totalBudget > 0 ? (expensesThisMonth / totalBudget) * 100 : 0;
                const isOverBudget = progress > 100;

                const budgetStatusElement = totalBudget > 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300">Monthly Budget</h4>
                            <button onClick={onEditOverallBudget} className="flex items-center space-x-1 text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                                <EditIcon className="h-4 w-4" />
                                <span>Edit Budget</span>
                            </button>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                {currency.symbol}{budgetRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-base font-normal text-gray-500 dark:text-gray-400 ml-2">Remaining</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{currency.symbol}{expensesThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> spent
                            </p>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3.5 relative">
                            <div 
                                className={`h-3.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'} transition-all duration-500`} 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Total Budget: {currency.symbol}{totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg shadow-inner text-center text-gray-600 dark:text-gray-400 flex flex-col items-center">
                        <WalletIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="font-semibold">No Monthly Budget Set</p>
                        <p className="text-sm mb-3">Set an overall budget to get started with tracking.</p>
                        <button onClick={onEditOverallBudget} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
                            Set Overall Budget
                        </button>
                    </div>
                );
                
                const StatCard: React.FC<{ title: string; amount: number; currencySymbol: string; color: string; icon: React.ReactNode }> = ({ title, amount, currencySymbol, color, icon }) => (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex items-start space-x-4">
                        <div className={`p-3 rounded-full ${color}`}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currencySymbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                );

                return (
                    <div className="space-y-6">
                        {budgetStatusElement}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <StatCard title="Total Income" amount={summary.income} currencySymbol={currency.symbol} color="bg-green-100 dark:bg-green-900/50" icon={<ArrowUpIcon className="h-6 w-6 text-green-500 dark:text-green-400" />} />
                                <StatCard title="Total Expenses" amount={summary.expenses} currencySymbol={currency.symbol} color="bg-red-100 dark:bg-red-900/50" icon={<ArrowDownIcon className="h-6 w-6 text-red-500 dark:text-red-400" />} />
                                <StatCard title="Current Balance" amount={summary.balance} currencySymbol={currency.symbol} color="bg-indigo-100 dark:bg-indigo-900/50" icon={<WalletIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />} />
                            </div>
                            <div className="h-[350px]">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">Expense Breakdown</h4>
                                <SpendingChart transactions={transactions} currency={currency} />
                            </div>
                        </div>
                    </div>
                );
            }
            case 'trends':
                return (
                     <div className="h-[350px]">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">7-Day Cumulative Spending</h4>
                        <SpendingTrendsChart transactions={transactions} currency={currency} />
                    </div>
                );
            case 'comparison':
                return (
                    <div className="h-[350px]">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">This Month vs. Last Month</h4>
                        <CategoryComparisonChart transactions={transactions} currency={currency} />
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div id="dashboard-container" className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
                    <button id="dashboard-tab-overview" onClick={() => setActiveTab('overview')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'}`}>
                        Overview
                    </button>
                    <button id="dashboard-tab-trends" onClick={() => setActiveTab('trends')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'trends' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'}`}>
                        Trends
                    </button>
                    <button id="dashboard-tab-comparison" onClick={() => setActiveTab('comparison')} className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'comparison' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'}`}>
                        Comparison
                    </button>
                </nav>
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default Dashboard;