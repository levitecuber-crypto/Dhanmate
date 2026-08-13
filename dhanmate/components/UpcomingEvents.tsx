import React from 'react';
import { CULTURAL_EVENTS } from '../data/events';

const UpcomingEvents: React.FC = () => {
    const today = new Date();
    // Set time to 0 to compare dates only
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const upcomingEvents = CULTURAL_EVENTS.filter(event => {
        const startDate = new Date(event.startDate + 'T00:00:00');
        return startDate >= today && startDate <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    if (upcomingEvents.length === 0) {
        return null; // Don't render anything if no events are coming up
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200 mb-4">Upcoming Events</h3>
            <div className="space-y-3">
                {upcomingEvents.map(event => {
                    const startDate = new Date(event.startDate + 'T00:00:00');
                    const diffTime = startDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return (
                        <div key={event.name + event.startDate} className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50">
                            <p className="font-semibold text-indigo-800 dark:text-indigo-200">{event.name}</p>
                            <p className="text-sm text-indigo-600 dark:text-indigo-300">
                                Starts in {diffDays} {diffDays === 1 ? 'day' : 'days'} on {startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.
                            </p>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-2">Plan your budget ahead to stay on track!</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UpcomingEvents;