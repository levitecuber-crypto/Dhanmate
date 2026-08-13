import React from 'react';
import { BudgetCategory, Transaction, Currency } from '../types';
import CategoryBudgets from './CategoryBudgets';

interface BudgetProps {
    budgetCategories: BudgetCategory[];
    transactions: Transaction[];
    currency: Currency;
    onAddCategory: (category: Omit<BudgetCategory, 'id'>) => void;
    onUpdateCategory: (categoryId: string, updatedData: { name: string; amount: number; carryOver: boolean }) => void;
    onDeleteCategory: (categoryId: string) => void;
    budgetSummary: {
        totalBudget: number;
        expensesThisMonth: number;
        budgetRemaining: number;
    };
    onEditOverallBudget: () => void;
}

const Budget: React.FC<BudgetProps> = (props) => {
    const { budgetSummary, currency, onEditOverallBudget } = props;
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-24">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Manage Your Budget</h2>
                <p className="text-gray-500 dark:text-gray-400">Set monthly spending limits for different categories using envelopes. Unused funds can be carried over to the next month if you enable the option.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Monthly Budget Summary</h3>
                    <button onClick={onEditOverallBudget} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                        Edit Overall Budget
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currency.symbol}{budgetSummary.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Spent This Month</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{currency.symbol}{budgetSummary.expensesThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
                        <p className={`text-2xl font-bold ${budgetSummary.budgetRemaining < 0 ? 'text-red-500' : 'text-green-500'}`}>{currency.symbol}{budgetSummary.budgetRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            <CategoryBudgets 
                budgetCategories={props.budgetCategories}
                transactions={props.transactions}
                currency={props.currency}
                onAddCategory={props.onAddCategory}
                onUpdateCategory={props.onUpdateCategory}
                onDeleteCategory={props.onDeleteCategory}
            />
        </div>
    );
};

export default Budget;