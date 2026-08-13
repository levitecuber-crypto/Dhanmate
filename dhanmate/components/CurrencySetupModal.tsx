import React, { useState } from 'react';
import { Currency } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../constants';
import { AppLogo } from './icons';

interface CurrencySetupModalProps {
    onCurrencySelect: (currency: Currency) => void;
}

const CurrencySetupModal: React.FC<CurrencySetupModalProps> = ({ onCurrencySelect }) => {
    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>(DEFAULT_CURRENCY.code);

    const handleContinue = () => {
        const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrencyCode);
        if (selectedCurrency) {
            onCurrencySelect(selectedCurrency);
        }
    };

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm m-4 text-center">
                <AppLogo className="h-12 w-auto text-emerald-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome to DhanMate</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Please select your currency to get started.</p>

                <div className="mb-6">
                    <label htmlFor="currency" className="sr-only">Currency</label>
                    <select
                        id="currency"
                        value={selectedCurrencyCode}
                        onChange={e => setSelectedCurrencyCode(e.target.value)}
                        className="block w-full text-base rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-200 p-3"
                    >
                        {SUPPORTED_CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.symbol} {c.code} - {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleContinue}
                    className="w-full bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors duration-200 shadow"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default CurrencySetupModal;