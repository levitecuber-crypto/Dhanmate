import React, { useState } from 'react';
import { Currency } from '../types';

interface OverallBudgetModalProps {
    onClose: () => void;
    onSave: (newTotalBudget: number) => void;
    currency: Currency;
    currentTotalBudget: number;
}

const OverallBudgetModal: React.FC<OverallBudgetModalProps> = ({ onClose, onSave, currency, currentTotalBudget }) => {
    const [newTotal, setNewTotal] = useState(currentTotalBudget > 0 ? currentTotalBudget.toString() : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(newTotal);
        if (!numericAmount || numericAmount <= 0) {
            alert("Please enter a valid positive budget amount.");
            return;
        }
        onSave(numericAmount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set Overall Monthly Budget</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="total-budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Total Monthly Budget ({currency.symbol})
                        </label>
                        <input 
                            type="number" 
                            id="total-budget" 
                            value={newTotal} 
                            onChange={e => setNewTotal(e.target.value)} 
                            step="1" 
                            placeholder="e.g., 50000" 
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" 
                            required 
                            autoFocus 
                        />
                         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Setting a new total will proportionally adjust your existing category budgets. If you have no budget set, it will be distributed evenly.
                        </p>
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">Save Budget</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OverallBudgetModal;