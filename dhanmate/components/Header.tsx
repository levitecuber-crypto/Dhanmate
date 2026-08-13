import React from 'react';
import { SignOutIcon, AppLogo } from './icons';
import { User } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
    user: User;
    onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm dark:border-b dark:border-gray-700 flex-shrink-0">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-3">
                        <AppLogo className="h-8 w-auto text-emerald-500" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 hidden sm:block">DhanMate</h1>
                    </div>
                     <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                             <img src={user.profileImage} alt="User profile" className="h-10 w-10 rounded-full object-cover" />
                             <div className="hidden md:block">
                                <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{user.username}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                             </div>
                        </div>
                        <ThemeToggle />
                        <button
                            onClick={onSignOut}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            aria-label="Sign Out"
                        >
                            <SignOutIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;