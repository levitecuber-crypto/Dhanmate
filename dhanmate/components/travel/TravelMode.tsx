import React from 'react';
import { Trip } from '../../types';
import { PlusIcon, PlaneIcon, MapPinIcon, CalendarIcon } from '../icons';

interface TravelModeProps {
    trips: Trip[];
    onSelectTrip: (tripId: string) => void;
    onNewTrip: () => void;
}

const TripCard: React.FC<{ trip: Trip; onSelect: () => void; }> = ({ trip, onSelect }) => {
    const isActive = trip.status === 'active';
    const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const progress = trip.totalBudget > 0 ? (totalSpent / trip.totalBudget) * 100 : 0;
    
    return (
        <button onClick={onSelect} className="w-full text-left bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg hover:ring-2 hover:ring-emerald-500 transition-all duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">{trip.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{trip.destination}</span>
                    </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {isActive ? 'Active' : 'Completed'}
                </span>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    <span>Spent</span>
                    <span>Budget</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${progress > 100 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                </div>
            </div>
             <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
                <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(trip.startDate + 'T00:00:00').toLocaleDateString()} - {new Date(trip.endDate + 'T00:00:00').toLocaleDateString()}</span>
                </div>
            </div>
        </button>
    );
};

const TravelMode: React.FC<TravelModeProps> = ({ trips, onSelectTrip, onNewTrip }) => {
    const activeTrips = trips.filter(t => t.status === 'active');
    const completedTrips = trips.filter(t => t.status === 'completed');

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Travel Mode</h2>
                <button onClick={onNewTrip} className="flex items-center space-x-2 bg-emerald-500 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-600 transition-colors shadow">
                    <PlusIcon className="h-5 w-5" />
                    <span>New Trip</span>
                </button>
            </div>

            {trips.length === 0 ? (
                 <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                    <PlaneIcon className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="mt-4 text-lg font-semibold text-gray-600 dark:text-gray-300">No trips planned yet.</p>
                    <p className="text-gray-500 dark:text-gray-400">Click 'New Trip' to start your next adventure!</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {activeTrips.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Active Trips</h3>
                            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Click on a trip to view its details and add expenses.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} onSelect={() => onSelectTrip(trip.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {completedTrips.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Completed Trips</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {completedTrips.map(trip => (
                                    <TripCard key={trip.id} trip={trip} onSelect={() => onSelectTrip(trip.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TravelMode;