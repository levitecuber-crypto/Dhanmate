import React from 'react';
import { Transaction, Currency } from '../types';
import { getCategoryIcon, getPaymentMethodIcon, EditIcon, TrashIcon, RepeatIcon } from './icons';

interface TransactionListProps {
    transactions: Transaction[];
    currency: Currency;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
}

const TransactionRow: React.FC<{ 
    transaction: Transaction; 
    currency: Currency; 
    onEdit: (transaction: Transaction) => void;
    onDelete: (transactionId: string) => void;
}> = ({ transaction, currency, onEdit, onDelete }) => {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const amountPrefix = isIncome ? '+' : '-';
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete this transaction: "${transaction.description}"?`)) {
            onDelete(transaction.id);
        }
    };

    return (
        <li className="group flex items-center justify-between py-4 px-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            <div className="flex items-center space-x-4">
                <span className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {getCategoryIcon(transaction.category, "h-6 w-6 text-gray-600 dark:text-gray-300")}
                </span>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                         {transaction.recurringTransactionId && (
                            <>
                                {/* FIX: Replaced non-standard 'titleAccess' prop with 'title' to provide a tooltip and resolve TypeScript error. */}
                                <RepeatIcon className="h-4 w-4" title="Recurring Transaction" />
                                <span>&bull;</span>
                            </>
                        )}
                        <span>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>&bull;</span>
                        <span>{transaction.category}</span>
                        {transaction.paymentMethod && (
                            <>
                                <span>&bull;</span>
                                <span className="flex items-center space-x-1">
                                    {getPaymentMethodIcon(transaction.paymentMethod, "h-4 w-4")}
                                    <span>{transaction.paymentMethod}</span>
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <p className={`font-bold text-lg ${amountColor} text-right`}>
                    {amountPrefix}{currency.symbol}{transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(transaction)} className="p-2 text-gray-400 hover:text-emerald-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Edit transaction">
                        <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600" aria-label="Delete transaction">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </li>
    );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, currency, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-200">Recent Transactions</h3>
            {transactions.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map(tx => <TransactionRow key={tx.id} transaction={tx} currency={currency} onEdit={onEdit} onDelete={onDelete} />)}
                </ul>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Click 'Add Transaction' to get started.</p>
                </div>
            )}
        </div>
    );
};

export default TransactionList;