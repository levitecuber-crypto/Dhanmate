import React from 'react';
import { RecurringTransaction, Currency } from '../types';
import { RepeatIcon, EditIcon, TrashIcon } from './icons';

const toTitleCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const RecurringTransactionItem: React.FC<{
    rt: RecurringTransaction;
    currency: Currency;
    onEdit: (rt: RecurringTransaction) => void;
    onDelete: (rtId: string) => void;
}> = ({ rt, currency, onEdit, onDelete }) => {
    const isIncome = rt.type === 'income';
    const amountColor = isIncome ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const amountPrefix = isIncome ? '+' : '-';

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the recurring transaction "${rt.description}"? This will stop future transactions from being generated.`)) {
            onDelete(rt.id);
        }
    };

    return (
        <li className="group flex items-center justify-between py-3 px-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
                <span className={`p-2 rounded-full ${isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                    <RepeatIcon className={`h-6 w-6 ${isIncome ? 'text-green-500' : 'text-red-500'}`} />
                </span>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{rt.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {toTitleCase(rt.frequency)} &bull; Starts {new Date(rt.startDate + 'T00:00:00').toLocaleDateString()}
                        {rt.endDate && ` &bull; Ends ${new Date(rt.endDate + 'T00:00:00').toLocaleDateString()}`}
                    </p>
                </div>
            </div>
            <div className="flex items-center">
                <p className={`font-bold text-lg ${amountColor} text-right`}>
                    {amountPrefix}{currency.symbol}{rt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                 <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(rt)} className="p-2 text-gray-400 hover:text-emerald-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Edit recurring transaction">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Delete recurring transaction">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
};

interface RecurringTransactionsProps {
    recurringTransactions: RecurringTransaction[];
    currency: Currency;
    onEdit: (rt: RecurringTransaction | 'new') => void;
    onDelete: (rtId: string) => void;
}

const RecurringTransactions: React.FC<RecurringTransactionsProps> = ({ recurringTransactions, currency, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Recurring Transactions</h3>
            </div>
            {recurringTransactions.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recurringTransactions.map(rt => (
                        <RecurringTransactionItem
                            key={rt.id}
                            rt={rt}
                            currency={currency}
                            onEdit={() => onEdit(rt)}
                            onDelete={onDelete}
                        />
                    ))}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <RepeatIcon className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No recurring transactions set up.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Add things like salary or rent to automate your tracking.</p>
                </div>
            )}
        </div>
    );
};

export default RecurringTransactions;