import React, { useState, useMemo, useEffect } from 'react';
import { RecurringTransaction, TransactionType, Category, PaymentMethod, Frequency, BudgetCategory } from '../types';
import { INCOME_CATEGORIES } from '../constants';

interface RecurringTransactionModalProps {
    onClose: () => void;
    onSave: (rt: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => void;
    recurringTransaction?: RecurringTransaction;
    budgetCategories: BudgetCategory[];
}

const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({ onClose, onSave, recurringTransaction, budgetCategories }) => {
    const isEditMode = Boolean(recurringTransaction);

    const [type, setType] = useState<TransactionType>(recurringTransaction?.type || 'expense');
    const [amount, setAmount] = useState(recurringTransaction?.amount.toString() || '');
    const [category, setCategory] = useState<Category>(recurringTransaction?.category || 'Food');
    const [description, setDescription] = useState(recurringTransaction?.description || '');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(recurringTransaction?.paymentMethod || 'Debit Card');
    const [frequency, setFrequency] = useState<Frequency>(recurringTransaction?.frequency || 'monthly');
    const [startDate, setStartDate] = useState(recurringTransaction?.startDate || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(recurringTransaction?.endDate || '');

    const categories = useMemo(() => {
        if (type === 'income') return INCOME_CATEGORIES;
        const expenseCats = budgetCategories.map(b => b.name).sort();
        return [...new Set(expenseCats)];
    }, [type, budgetCategories]);

    useEffect(() => {
        if (!categories.includes(category)) {
            setCategory(type === 'expense' ? 'Food' : 'Income');
        }
    }, [type, categories, category]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !category || !description) {
            alert("Please fill all fields correctly.");
            return;
        }
        if (endDate && new Date(startDate) > new Date(endDate)) {
            alert("End date cannot be before the start date.");
            return;
        }

        const rtData = {
            amount: numericAmount,
            category,
            description,
            type,
            paymentMethod: type === 'expense' ? paymentMethod : undefined,
            frequency,
            startDate,
            endDate: endDate || undefined,
        };

        onSave(isEditMode ? { ...rtData, id: recurringTransaction!.id } : rtData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isEditMode ? 'Edit' : 'Add'} Recurring Transaction</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                             <div className="flex rounded-md shadow-sm">
                                <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 text-sm font-medium w-1/2 rounded-l-md ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}>Expense</button>
                                <button type="button" onClick={() => setType('income')} className={`px-4 py-2 text-sm font-medium w-1/2 rounded-r-md ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}>Income</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="rt-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input type="number" id="rt-amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="rt-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <input type="text" id="rt-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Monthly Rent" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="rt-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                <select id="rt-category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            {type === 'expense' && (
                                <div>
                                    <label htmlFor="rt-paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                                    <select id="rt-paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required>
                                        <option>Credit Card</option>
                                        <option>Debit Card</option>
                                        <option>Cash</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-4 border-t dark:border-gray-600 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">Recurrence Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="rt-frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                                <select id="rt-frequency" value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="rt-startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                <input type="date" id="rt-startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="rt-endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date (Optional)</label>
                            <input type="date" id="rt-endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-white" />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">{isEditMode ? 'Save Changes' : 'Save Recurring'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecurringTransactionModal;
