import React from 'react';
import { HomeIcon, PlaneIcon, TargetIcon, WalletIcon, WandIcon } from './icons';

type View = 'dashboard' | 'travel' | 'goals' | 'aicoach' | 'budget';

interface BottomNavigationProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    id: string;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ id, label, icon, isActive, onClick }) => {
    const activeClasses = 'text-emerald-500 dark:text-emerald-400';
    const inactiveClasses = 'text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400';
    return (
        <button
            id={id}
            onClick={onClick}
            className={`flex flex-col items-center justify-center space-y-1 p-2 flex-grow transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeView, setActiveView }) => {
    const navItems: { view: View; label: string; icon: React.ReactNode; }[] = [
        { view: 'dashboard', label: 'Home', icon: <HomeIcon className="h-6 w-6" /> },
        { view: 'travel', label: 'Travel', icon: <PlaneIcon className="h-6 w-6" /> },
        { view: 'goals', label: 'Goals', icon: <TargetIcon className="h-6 w-6" /> },
        { view: 'aicoach', label: 'AI Coach', icon: <WandIcon className="h-6 w-6" /> },
        { view: 'budget', label: 'Budget', icon: <WalletIcon className="h-6 w-6" /> },
    ];

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.2)]">
            <div className="flex justify-around items-center max-w-full mx-auto h-16">
                {navItems.map(item => (
                    <NavItem
                        key={item.view}
                        id={`bottom-nav-item-${item.view}`}
                        label={item.label}
                        icon={item.icon}
                        isActive={activeView === item.view}
                        onClick={() => setActiveView(item.view)}
                    />
                ))}
            </div>
        </nav>
    );
};

export default BottomNavigation;