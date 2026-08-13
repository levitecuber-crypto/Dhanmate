import React, { useState, useMemo } from 'react';
import { BudgetCategory, Transaction, Currency } from '../types';
import { WalletIcon, EditIcon, TrashIcon } from './icons';

interface CategoryBudgetsProps {
    budgetCategories: BudgetCategory[];
    transactions: Transaction[];
    currency: Currency;
    onAddCategory: (category: Omit<BudgetCategory, 'id'>) => void;
    onUpdateCategory: (categoryId: string, updatedData: { name: string; amount: number; carryOver: boolean }) => void;
    onDeleteCategory: (categoryId: string) => void;
}

const toTitleCase = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const BudgetItem: React.FC<{
    category: BudgetCategory;
    spentThisMonth: number;
    carryOverAmount: number;
    currency: Currency;
    onUpdate: (categoryId: string, updatedData: { name: string; amount: number; carryOver: boolean }) => void;
    onDelete: (categoryId: string) => void;
    allBudgetCategories: BudgetCategory[];
}> = ({ category, spentThisMonth, carryOverAmount, currency, onUpdate, onDelete, allBudgetCategories }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const [amount, setAmount] = useState(String(category.amount));
    const [carryOver, setCarryOver] = useState(category.carryOver ?? false);

    const totalBudgetForMonth = category.amount + carryOverAmount;
    const progress = totalBudgetForMonth > 0 ? (spentThisMonth / totalBudgetForMonth) * 100 : 0;
    const remaining = totalBudgetForMonth - spentThisMonth;
    
    let progressColor = 'bg-emerald-500';
    if (progress > 100) progressColor = 'bg-red-500';
    else if (progress >= 80) progressColor = 'bg-yellow-500';
    
    const handleSave = () => {
        const numericAmount = parseFloat(amount);
        const formattedName = toTitleCase(name.trim());
        if (formattedName && !isNaN(numericAmount) && numericAmount >= 0) {
            if (allBudgetCategories.some(c => c.id !== category.id && c.name.toLowerCase() === formattedName.toLowerCase())) {
                alert('A category with this name already exists.');
                return;
            }
            onUpdate(category.id, { name: formattedName, amount: numericAmount, carryOver });
            setIsEditing(false);
        } else {
            alert('Please enter a valid name and amount.');
        }
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
            onDelete(category.id);
        }
    };

    if (isEditing) {
        return (
            <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 mb-3 space-y-4">
                 <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Edit your budget</h4>
                 <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Category Name"
                    className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                />
                <input 
                    type="number" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={`Budget Amount (${currency.symbol})`}
                    className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                />
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id={`carryOver-${category.id}`} checked={carryOver} onChange={e => setCarryOver(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"/>
                    <label htmlFor={`carryOver-${category.id}`} className="text-sm text-gray-700 dark:text-gray-300">Carry over unused budget to next month</label>
                </div>
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSave} className="px-3 py-1 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">Save</button>
                </div>
            </div>
        )
    }

    if (category.amount === 0) {
        return (
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-3 flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-gray-200">{category.name}</p>
                <button 
                    onClick={() => setIsEditing(true)} 
                    className="px-3 py-1.5 text-sm font-semibold text-emerald-600 bg-emerald-100 rounded-lg hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/80 transition-colors"
                >
                    Set a budget
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
            <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 break-words pr-2">{category.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{currency.symbol}{spentThisMonth.toLocaleString()}</span> spent of {currency.symbol}{totalBudgetForMonth.toLocaleString()}
                    </p>
                    {carryOverAmount > 0 && <p className="text-xs text-emerald-600 dark:text-emerald-400">(incl. {currency.symbol}{carryOverAmount.toLocaleString()} carry-over)</p>}
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 my-2">
                <div className={`${progressColor} h-2 rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
             <p className={`text-xs text-right ${progress > 100 ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                {progress > 100 
                    ? `${currency.symbol}${Math.abs(remaining).toLocaleString()} over budget` 
                    : `${currency.symbol}${remaining.toLocaleString()} remaining`
                }
            </p>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center space-x-4">
                {!category.isDefault && (
                    <button onClick={handleDelete} className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors" aria-label="Delete budget category">
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                    </button>
                )}
                <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors" aria-label="Edit Your Budget">
                    <EditIcon className="h-6 w-6" />
                    <span>Edit Your Budget</span>
                </button>
            </div>
        </div>
    );
};


const CategoryBudgets: React.FC<CategoryBudgetsProps> = ({ budgetCategories, transactions, currency, onAddCategory, onUpdateCategory, onDeleteCategory }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [carryOver, setCarryOver] = useState(false);
    
    const spendingData = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const getExpensesForMonth = (month: number, year: number) => transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && tDate.getMonth() === month && tDate.getFullYear() === year;
        });

        const currentMonthExpenses = getExpensesForMonth(currentMonth, currentYear);
        const lastMonthExpenses = getExpensesForMonth(lastMonth, lastMonthYear);
        
        const calculateSpending = (expenseList: Transaction[]): Record<string, number> => {
            const spending: Record<string, number> = {};
            expenseList.forEach(t => {
                spending[t.category] = (spending[t.category] || 0) + t.amount;
            });
            return spending;
        };

        const spentThisMonth = calculateSpending(currentMonthExpenses);
        const spentLastMonth = calculateSpending(lastMonthExpenses);

        const carryOverByCategory: Record<string, number> = {};
        budgetCategories.forEach(cat => {
            if (cat.carryOver) {
                const budgetLastMonth = cat.amount;
                const spent = spentLastMonth[cat.name] || 0;
                if (spent < budgetLastMonth) {
                    carryOverByCategory[cat.name] = budgetLastMonth - spent;
                }
            }
        });

        return { spentThisMonth, carryOverByCategory };
    }, [transactions, budgetCategories]);

    const handleAddCategory = () => {
        const numericAmount = parseFloat(amount);
        const formattedName = toTitleCase(name.trim());
        if (formattedName && !isNaN(numericAmount) && numericAmount >= 0) {
            if (budgetCategories.some(c => c.name.toLowerCase() === formattedName.toLowerCase())) {
                alert("A category with this name already exists.");
                return;
            }
            onAddCategory({ name: formattedName, amount: numericAmount, isDefault: false, carryOver });
            setName('');
            setAmount('');
            setCarryOver(false);
            setIsAdding(false);
        } else {
            alert("Please enter a valid name and budget amount.");
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Category Budgets (Envelopes)</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="text-emerald-500 hover:text-emerald-600 font-semibold text-sm">
                    {isAdding ? 'Cancel' : '+ New Envelope'}
                </button>
            </div>
            
             {isAdding && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4">
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Category Name (e.g., Groceries)"
                        className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                        type="number" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder={`Monthly Budget (${currency.symbol})`}
                        className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="carryOver-new" checked={carryOver} onChange={e => setCarryOver(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"/>
                        <label htmlFor="carryOver-new" className="text-sm text-gray-700 dark:text-gray-300">Carry over unused budget</label>
                    </div>
                    <button onClick={handleAddCategory} className="w-full bg-emerald-500 text-white font-semibold text-sm py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                        Save Envelope
                    </button>
                </div>
            )}

            {budgetCategories.length > 0 ? (
                budgetCategories.filter(c => c.amount > 0 || !c.isDefault || ['Travel', 'Food', 'Shopping'].includes(c.name)).sort((a,b) => a.name.localeCompare(b.name)).map(cat => (
                    <BudgetItem 
                        key={cat.id} 
                        category={cat} 
                        spentThisMonth={spendingData.spentThisMonth[cat.name] || 0}
                        carryOverAmount={spendingData.carryOverByCategory[cat.name] || 0}
                        currency={currency}
                        onUpdate={onUpdateCategory}
                        onDelete={onDeleteCategory}
                        allBudgetCategories={budgetCategories}
                    />
                ))
            ) : (
                <div className="text-center py-6">
                    <WalletIcon className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No budget envelopes set.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Create an envelope to start budgeting!</p>
                </div>
            )}
        </div>
    );
};

export default CategoryBudgets;