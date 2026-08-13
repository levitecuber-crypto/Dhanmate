import React, { useState, useEffect } from 'react';
import { Trip, Currency } from '../../types';
import { getTripSummaryAdvice } from '../../services/geminiService';
import { SpinnerIcon, WandIcon } from '../icons';

interface TripSummaryModalProps {
    trip: Trip;
    currency: Currency;
    onClose: () => void;
}

const TripSummaryModal: React.FC<TripSummaryModalProps> = ({ trip, currency, onClose }) => {
    const [advice, setAdvice] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAdvice = async () => {
            setIsLoading(true);
            try {
                const result = await getTripSummaryAdvice(trip, currency);
                setAdvice(result);
            } catch (e) {
                console.error(e);
                setAdvice("Couldn't get advice, but hope you had a great trip!");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdvice();
    }, [trip, currency]);

    const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const difference = trip.totalBudget - totalSpent;
    const isOverBudget = difference < 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all text-center" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Trip Summary</h2>
                    <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 mt-1">{trip.name}</p>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 space-y-4">
                    <div className="flex justify-around">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Budgeted</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{currency.symbol}{trip.totalBudget.toLocaleString()}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Spent</p>
                            <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{currency.symbol}{totalSpent.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isOverBudget ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{isOverBudget ? 'You went over budget by:' : 'You were under budget by:'}</p>
                        <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                           {currency.symbol}{Math.abs(difference).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="p-6">
                     <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center justify-center space-x-2">
                        <WandIcon className="h-5 w-5 text-emerald-500" />
                        <span>AI Insight</span>
                    </h3>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-16">
                            <SpinnerIcon className="h-8 w-8 text-emerald-500" />
                        </div>
                    ) : (
                         <p className="text-gray-600 dark:text-gray-300 italic">"{advice}"</p>
                    )}
                </div>

                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                     <button onClick={onClose} className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600 shadow-sm">
                        Awesome!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TripSummaryModal;