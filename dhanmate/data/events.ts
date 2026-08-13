
export interface CulturalEvent {
    name: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
}

// Approximate dates for major Indian festivals and seasons.
// Note: Some festival dates are based on the lunar calendar and vary. These are approximations.
export const CULTURAL_EVENTS: CulturalEvent[] = [
    // 2024
    { name: 'Holi', startDate: '2024-03-25', endDate: '2024-03-25' },
    { name: 'Eid al-Fitr', startDate: '2024-04-10', endDate: '2024-04-11' },
    { name: 'Ganesh Chaturthi', startDate: '2024-09-07', endDate: '2024-09-17' },
    { name: 'Navratri', startDate: '2024-10-03', endDate: '2024-10-12' },
    { name: 'Diwali', startDate: '2024-11-01', endDate: '2024-11-05' },
    { name: 'Christmas', startDate: '2024-12-25', endDate: '2024-12-25' },
    { name: 'Wedding Season', startDate: '2024-11-15', endDate: '2025-02-15' },

    // 2025
    { name: 'Pongal', startDate: '2025-01-14', endDate: '2025-01-17' },
    { name: 'Holi', startDate: '2025-03-14', endDate: '2025-03-14' },
    { name: 'Eid al-Fitr', startDate: '2025-03-31', endDate: '2025-03-31' },
    { name: 'Ganesh Chaturthi', startDate: '2025-08-27', endDate: '2025-09-06' },
    { name: 'Navratri', startDate: '2025-09-22', endDate: '2025-10-01' },
    { name: 'Diwali', startDate: '2025-10-21', endDate: '2025-10-25' },
    { name: 'Christmas', startDate: '2025-12-25', endDate: '2025-12-25' },
    { name: 'Wedding Season', startDate: '2025-11-15', endDate: '2026-02-15' },
];

export const findEventForDate = (dateStr: string): CulturalEvent | undefined => {
    // Add T00:00:00 to handle date parsing consistently across timezones
    const targetDate = new Date(dateStr + 'T00:00:00');
    if (isNaN(targetDate.getTime())) return undefined;

    return CULTURAL_EVENTS.find(event => {
        const startDate = new Date(event.startDate + 'T00:00:00');
        const endDate = new Date(event.endDate + 'T00:00:00');
        return targetDate >= startDate && targetDate <= endDate;
    });
};
