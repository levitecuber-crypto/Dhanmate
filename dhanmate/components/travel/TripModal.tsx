import React, { useState } from 'react';
import { Trip } from '../../types';

interface TripModalProps {
    onClose: () => void;
    onSave: (trip: Omit<Trip, 'id' | 'expenses' | 'status'> | Trip) => void;
    trip?: Trip;
}

const TripModal: React.FC<TripModalProps> = ({ onClose, onSave, trip }) => {
    const isEditMode = Boolean(trip);
    const [name, setName] = useState(trip?.name || '');
    const [destination, setDestination] = useState(trip?.destination || '');
    const [startDate, setStartDate] = useState(trip?.startDate || new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(trip?.endDate || new Date().toISOString().split('T')[0]);
    const [totalBudget, setTotalBudget] = useState(trip?.totalBudget?.toString() || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericBudget = parseFloat(totalBudget);
        if (!name || !destination || !startDate || !endDate || !numericBudget || numericBudget <= 0) {
            alert("Please fill all fields correctly.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert("End date cannot be before the start date.");
            return;
        }

        const tripData = { name, destination, startDate, endDate, totalBudget: numericBudget };
        onSave(isEditMode ? { ...trip!, ...tripData } : tripData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{isEditMode ? 'Edit Trip' : 'Create a New Trip'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Trip Name</label>
                        <input type="text" id="tripName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Goa Trip 2025" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                    </div>
                     <div>
                        <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination</label>
                        <input type="text" id="destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Goa, India" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Trip Budget</label>
                        <input type="number" id="totalBudget" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} step="0.01" placeholder="e.g., 50000" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white" required />
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">{isEditMode ? 'Save Changes' : 'Create Trip'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TripModal;