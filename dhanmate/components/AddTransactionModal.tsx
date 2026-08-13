import React, { useState } from 'react';
import { Transaction, TransactionType, Category, Currency } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface AddTransactionModalProps {
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    currency: Currency;
}

const Calendar: React.FC<{
    selectedDate: string;
    onDateSelect: (date: string) => void;
}> = ({ selectedDate, onDateSelect }) => {
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

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="text-center p-2 w-8 h-8"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const fullDate = new Date(year, month, day);
        const dateStr = fullDate.toISOString().split('T')[0];
        const isSelected = dateStr === selectedDate;
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        calendarDays.push(
            <button
                type="button"
                key={day}
                onClick={() => onDateSelect(dateStr)}
                className={`text-center p-2 rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors
                    ${isSelected ? 'bg-emerald-500 text-white font-semibold' : 'text-gray-700'}
                    ${!isSelected && isToday ? 'bg-gray-200' : ''}
                    ${!isSelected ? 'hover:bg-gray-100' : ''}
                `}
            >
                {day}
            </button>
        );
    }
    
    return (
        <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
            <div className="flex justify-between items-center mb-2">
                <button type="button" onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="h-5 w-5" /></button>
                <div className="font-semibold text-gray-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                <button type="button" onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronRightIcon className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
                {daysOfWeek.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 place-items-center">
                {calendarDays}
            </div>
        </div>
    );
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onAddTransaction, currency }) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category>('Food');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const handleTypeChange = (newType: TransactionType) => {
        setType(newType);
        if (newType === 'income') {
            setCategory('Income');
        } else {
            setCategory('Food');
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (!numericAmount || numericAmount <= 0 || !category || !description) {
            alert("Please fill all fields correctly.");
            return;
        }
        
        // FIX: Added missing 'paymentMethod' property to satisfy the Transaction type.
        onAddTransaction({
            amount: numericAmount,
            category,
            date,
            description,
            type,
            paymentMethod: type === 'expense' ? 'Debit Card' : 'Cash'
        });
        
        onClose();
    };
    
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <div className="flex rounded-md shadow-sm">
                            <button type="button" onClick={() => handleTypeChange('expense')} className={`px-4 py-2 text-sm font-medium w-1/2 rounded-l-md ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Expense</button>
                            <button type="button" onClick={() => handleTypeChange('income')} className={`px-4 py-2 text-sm font-medium w-1/2 rounded-r-md ${type === 'income' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Income</button>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount ({currency.symbol})</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" placeholder="0.00" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50" required />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Coffee with friends" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50" required />
                    </div>

                     <div className="mb-4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as Category)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50" required>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="mb-6">
                         <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                        <div className="relative mt-1">
                            <input 
                                type="text" 
                                id="date" 
                                value={date} 
                                readOnly 
                                onClick={() => setIsCalendarOpen(prev => !prev)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 cursor-pointer"
                            />
                            <button 
                                type="button"
                                onClick={() => setIsCalendarOpen(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                aria-label="Open calendar"
                            >
                                <CalendarIcon className="h-5 w-5" />
                            </button>
                            {isCalendarOpen && (
                                <Calendar 
                                    selectedDate={date}
                                    onDateSelect={(newDate) => {
                                        setDate(newDate);
                                        setIsCalendarOpen(false);
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">Add Transaction</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
