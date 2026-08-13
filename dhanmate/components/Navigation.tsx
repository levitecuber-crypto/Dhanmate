import React from 'react';
import { HomeIcon, PlaneIcon, TargetIcon, WalletIcon, WandIcon, AppLogo } from './icons';

type View = 'dashboard' | 'travel' | 'goals' | 'aicoach' | 'budget';

interface NavigationProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    id: string;
    view: View;
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ id, view, label, icon, isActive, onClick }) => {
    const activeClasses = 'bg-emerald-500 text-white shadow-md';
    const inactiveClasses = 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700';

    return (
        <button
            id={id}
            onClick={onClick}
            className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            aria-current={isActive ? 'page' : undefined}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView }) => {
    const navItems: { view: View; label: string; icon: React.ReactNode; }[] = [
        { view: 'dashboard', label: 'Dashboard', icon: <HomeIcon className="h-6 w-6" /> },
        { view: 'travel', label: 'Travel', icon: <PlaneIcon className="h-6 w-6" /> },
        { view: 'goals', label: 'Goals', icon: <TargetIcon className="h-6 w-6" /> },
        { view: 'aicoach', label: 'AI Coach', icon: <WandIcon className="h-6 w-6" /> },
        { view: 'budget', label: 'Budget', icon: <WalletIcon className="h-6 w-6" /> },
    ];

    return (
        <nav className="hidden lg:flex w-64 bg-white dark:bg-gray-800 p-4 border-r dark:border-gray-700 flex-col flex-shrink-0">
            <div className="flex items-center space-x-3 mb-8 px-2">
                 <AppLogo className="h-8 w-auto text-emerald-500" />
                 <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">DhanMate</h1>
            </div>
            <div className="space-y-2">
                {navItems.map(item => (
                    <NavItem
                        key={item.view}
                        id={`nav-item-${item.view}`}
                        view={item.view}
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

export default Navigation;