import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, TransactionType, Category, Currency, PaymentMethod, BudgetCategory } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, SpinnerIcon, WandIcon } from './icons';
import { parseReceipt, parseVoiceCommand } from '../services/geminiService';
import CameraCapture from './CameraCapture';
import VoiceInputControl from './VoiceInputControl';

interface TransactionModalProps {
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    currency: Currency;
    transaction?: Transaction;
    budgetCategories: BudgetCategory[];
}

type Tab = 'manual' | 'scan' | 'voice';

const Calendar: React.FC<{ selectedDate: string; onDateSelect: (date: string) => void; }> = ({ selectedDate, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date(selectedDate + 'T00:00:00'));

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} className="text-center p-2 w-8 h-8"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateStr = fullDate.toISOString().split('T')[0];
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        calendarDays.push(
            <button type="button" key={day} onClick={() => onDateSelect(dateStr)}
                className={`text-center p-2 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors ${isSelected ? 'bg-emerald-500 text-white font-semibold' : 'text-gray-700 dark:text-gray-300'} ${!isSelected && isToday ? 'bg-gray-200 dark:bg-gray-600' : ''} ${!isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}>
                {day}
            </button>
        );
    }
    
    return (
        <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 p-4">
            <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeftIcon className="h-5 w-5" /></button>
                <div className="font-semibold text-gray-800 dark:text-gray-200">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRightIcon className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">{calendarDays}</div>
        </div>
    );
};


const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, onSave, currency, transaction, budgetCategories }) => {
    const isEditMode = Boolean(transaction);
    const [activeTab, setActiveTab] = useState<Tab>('manual');
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Form state
    const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
    const [amount, setAmount] = useState(transaction?.amount.toString() || '');
    const [category, setCategory] = useState<Category>(transaction?.category || 'Food');
    const [description, setDescription] = useState(transaction?.description || '');
    const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction?.paymentMethod || 'Debit Card');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const categories = useMemo(() => {
        if (type === 'income') {
            return INCOME_CATEGORIES;
        }
        // For expenses, use the list of budget categories which includes defaults and user-added ones.
        const expenseCats = budgetCategories.map(b => b.name).sort();
        return [...new Set(expenseCats)]; // Dedupe and sort
    }, [type, budgetCategories]);
    
    useEffect(() => {
        const currentCategories = categories;
        if (!currentCategories.includes(category)) {
             setCategory(type === 'expense' ? 'Food' : 'Income');
        }
    }, [type, category, categories]);

    const populateForm = (data: Partial<Omit<Transaction, 'id' | 'date' | 'type'>>) => {
        if (data.amount) setAmount(data.amount.toString());
        if (data.description) setDescription(data.description);
        if (data.category && EXPENSE_CATEGORIES.includes(data.category)) {
            setCategory(data.category);
        }
        setType('expense');
    }

    const handleReceiptCapture = async (dataUrl: string) => {
        setIsLoadingAi(true);
        setAiError(null);
        setActiveTab('manual');
        try {
            const parsedData = await parseReceipt(dataUrl);
            populateForm(parsedData);
        } catch (error: any) {
            setAiError(error.message || 'Failed to parse receipt.');
        } finally {
            setIsLoadingAi(false);
        }
    };
    
    const handleVoiceResult = async (transcript: string) => {
        setIsLoadingAi(true);
        setAiError(null);
        try {
            const parsedData = await parseVoiceCommand(transcript);
            populateForm(parsedData);
            setActiveTab('manual');
        } catch (error: any) {
            setAiError(error.message || 'Failed to parse voice command.');
        } finally {
            setIsLoadingAi(false);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !category || !description) {
            alert("Please fill all fields correctly.");
            return;
        }

        const transactionData = { amount: numericAmount, category, date, description, type, paymentMethod };
        onSave(isEditMode ? { ...transactionData, id: transaction!.id } : transactionData);
        onClose();
    };

    const renderManualTab = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
             {isLoadingAi && (
                <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex flex-col justify-center items-center z-10 rounded-lg">
                    <SpinnerIcon className="h-10 w-10 text-emerald-500" />
                    <p className="mt-2 text-gray-600 dark:text-gray-300 font-semibold">Parsing details...</p>
                </div>
            )}
             {aiError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                    <strong className="font-bold">Oops! </strong>
                    <span className="block sm:inline">{aiError}</span>
                    <button type="button" onClick={() => setAiError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
                        <span className="text-xl">×</span>
                    </button>
                </div>
            )}
            <div>
                <div className="flex rounded-md shadow-sm">
                    <button type="button" onClick={() => setType('expense')} className={`px-4 py-2 text-sm font-medium w-1/2 rounded-l-md ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}>Expense</button>
                    <button type="button" onClick={() => setType('income')} className={`px-4 py-2 text-sm font-medium w-1/2 rounded-r-md ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}>Income</button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount ({currency.symbol})</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                </div>
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <div className="relative mt-1">
                        <input type="text" id="date" value={date} readOnly onClick={() => setIsCalendarOpen(prev => !prev)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white cursor-pointer"/>
                        <button type="button" onClick={() => setIsCalendarOpen(prev => !prev)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500" aria-label="Open calendar"><CalendarIcon className="h-5 w-5" /></button>
                        {isCalendarOpen && <Calendar selectedDate={date} onDateSelect={(newDate) => { setDate(newDate); setIsCalendarOpen(false); }} />}
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Coffee with friends" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 { type === 'expense' && (
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Method</label>
                        <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required>
                            <option>Credit Card</option>
                            <option>Debit Card</option>
                            <option>Cash</option>
                        </select>
                    </div>
                 )}
            </div>
            <div className="flex justify-end space-x-4 pt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">
                    {isEditMode ? 'Save Changes' : 'Add Transaction'}
                </button>
            </div>
        </form>
    );

    const renderScanTab = () => <CameraCapture onCapture={handleReceiptCapture} onClose={() => setActiveTab('manual')} />;
    const renderVoiceTab = () => (
         <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Add Expense by Voice</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Press 'Start Recording' and say something like: <br /> <em className="text-gray-600 dark:text-gray-300">"Spent twelve fifty on coffee at Starbucks"</em>. <br/>Press 'Stop Recording' when you're done.</p>
            <VoiceInputControl 
                onResult={handleVoiceResult}
                onProcessingStart={() => setIsLoadingAi(true)}
                onProcessingEnd={() => setIsLoadingAi(false)}
                onError={setAiError}
                disabled={isLoadingAi}
            />
        </div>
    );

    if (activeTab === 'scan') {
        return renderScanTab();
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {!isEditMode && (
                     <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-6 justify-center" aria-label="Tabs">
                            <button onClick={() => setActiveTab('manual')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'manual' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'}`}>Manual</button>
                            <button onClick={() => setActiveTab('scan')} className={'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'}>Scan Receipt</button>
                            <button onClick={() => setActiveTab('voice')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'voice' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'}`}>Voice Input</button>
                        </nav>
                    </div>
                )}
                
                <div className="p-6 relative">
                    {activeTab === 'manual' && renderManualTab()}
                    {activeTab === 'voice' && renderVoiceTab()}
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;