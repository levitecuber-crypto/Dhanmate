import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, Currency, User, Goal, BudgetCategory, Trip, TripExpense, RecurringTransaction } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionModal from './components/TransactionModal';
import CurrencySetupModal from './components/CurrencySetupModal';
import Login from './components/Login';
import Goals from './components/Goals';
import Budget from './components/Settings';
import AiCoach from './components/AiCoach';
import TravelMode from './components/travel/TravelMode';
import TripDetail from './components/travel/TripDetail';
import TripModal from './components/travel/TripModal';
import TripExpenseModal from './components/travel/TripExpenseModal';
import TripSummaryModal from './components/travel/TripSummaryModal';
import Navigation from './components/Navigation';
import BottomNavigation from './components/BottomNavigation';
import { PlusIcon, PlusCircleIcon, RepeatIcon } from './components/icons';
import { EXPENSE_CATEGORIES } from './constants';
import RecurringTransactionModal from './components/RecurringTransactionModal';
import AppTutorial from './components/AppTutorial';
import OverallBudgetModal from './components/OverallBudgetModal';

type View = 'dashboard' | 'travel' | 'goals' | 'aicoach' | 'budget';

interface UserData {
    transactions: Transaction[];
    currency: Currency | null;
    goals: Goal[];
    budgetCategories: BudgetCategory[];
    trips: Trip[];
    recurringTransactions: RecurringTransaction[];
}

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData>({
        transactions: [],
        currency: null,
        goals: [],
        budgetCategories: [],
        trips: [],
        recurringTransactions: [],
    });
    
    // UI State
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | 'new' | null>(null);
    const [editingTrip, setEditingTrip] = useState<Trip | 'new' | null>(null);
    const [editingTripExpense, setEditingTripExpense] = useState<'new' | null>(null);
    const [completedTrip, setCompletedTrip] = useState<Trip | null>(null);
    const [isAddingExpenseFromTravelView, setIsAddingExpenseFromTravelView] = useState(false);
    const [editingRecurringTransaction, setEditingRecurringTransaction] = useState<RecurringTransaction | 'new' | null>(null);
    const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isOverallBudgetModalOpen, setIsOverallBudgetModalOpen] = useState(false);


    // Effect to check for a logged-in user on initial load
    useEffect(() => {
        const loggedInUserEmail = localStorage.getItem('dhanmate-currentUser');
        if (loggedInUserEmail) {
            const users: User[] = JSON.parse(localStorage.getItem('dhanmate-users') || '[]');
            const user = users.find(u => u.email === loggedInUserEmail);
            if (user) {
                setCurrentUser(user);
            }
        }
    }, []);

    // Effect to load user data when currentUser changes
    useEffect(() => {
        if (currentUser) {
            try {
                const savedData = localStorage.getItem(`dhanmate-data-${currentUser.email}`);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    const defaultBudgets: BudgetCategory[] = EXPENSE_CATEGORIES.filter(
                      name => !parsedData.budgetCategories?.some((b: BudgetCategory) => b.name === name)
                    ).map((name, index) => ({
                      id: `default-${name}-${index}`,
                      name,
                      amount: 0,
                      isDefault: true,
                      carryOver: false,
                    }));

                    setUserData({
                        transactions: parsedData.transactions || [],
                        currency: parsedData.currency || null,
                        goals: parsedData.goals || [],
                        budgetCategories: [...(parsedData.budgetCategories || []), ...defaultBudgets],
                        trips: parsedData.trips || [],
                        recurringTransactions: parsedData.recurringTransactions || [],
                    });
                } else {
                     const defaultBudgets: BudgetCategory[] = EXPENSE_CATEGORIES.map((name, index) => ({
                        id: `default-${name}-${index}`,
                        name,
                        amount: 0,
                        isDefault: true,
                        carryOver: false,
                    }));
                     setUserData({
                        transactions: [],
                        currency: null,
                        goals: [],
                        budgetCategories: defaultBudgets,
                        trips: [],
                        recurringTransactions: [],
                    });
                }
            } catch (error: any) {
                console.error("Failed to load data from localStorage", error);
            }
        }
    }, [currentUser]);

    // Effect to save user data whenever it changes
    useEffect(() => {
        if (currentUser && userData) {
            try {
                localStorage.setItem(`dhanmate-data-${currentUser.email}`, JSON.stringify(userData));
            } catch (error: any) {
                console.error("Failed to save data to localStorage", error);
            }
        }
    }, [userData, currentUser]);
    
    // Effect for handling recurring transactions
    useEffect(() => {
        if (!currentUser || !userData.recurringTransactions.length) return;

        const processRecurringTransactions = () => {
            const lastCheckStr = localStorage.getItem(`dhanmate-lastRecurringCheck-${currentUser.email}`);
            const now = new Date();
            now.setHours(23, 59, 59, 999); // Use end of today for comparison to include today

            const lastCheck = lastCheckStr ? new Date(lastCheckStr) : new Date(new Date().setDate(now.getDate() - 1));
            
            const newTransactions: Transaction[] = [];

            userData.recurringTransactions.forEach(rt => {
                let currentDate = new Date(rt.startDate + 'T00:00:00');
                const endDate = rt.endDate ? new Date(rt.endDate + 'T00:00:00') : null;

                if (currentDate > now) return;
                
                // Fast-forward to the first relevant date to check within the window
                while (currentDate < lastCheck && (!endDate || currentDate <= endDate)) {
                    switch (rt.frequency) {
                        case 'daily': currentDate.setDate(currentDate.getDate() + 1); break;
                        case 'weekly': currentDate.setDate(currentDate.getDate() + 7); break;
                        case 'monthly': currentDate.setMonth(currentDate.getMonth() + 1); break;
                        case 'yearly': currentDate.setFullYear(currentDate.getFullYear() + 1); break;
                    }
                }
                
                while (currentDate <= now) {
                    if (endDate && currentDate > endDate) break;

                    if (currentDate > lastCheck) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        const alreadyExists = userData.transactions.some(t =>
                            t.recurringTransactionId === rt.id && t.date === dateStr
                        );

                        if (!alreadyExists) {
                            newTransactions.push({
                                id: `${rt.id}-${dateStr}`,
                                date: dateStr,
                                amount: rt.amount,
                                type: rt.type,
                                category: rt.category,
                                description: rt.description,
                                paymentMethod: rt.paymentMethod,
                                recurringTransactionId: rt.id,
                            });
                        }
                    }

                    switch (rt.frequency) {
                        case 'daily': currentDate.setDate(currentDate.getDate() + 1); break;
                        case 'weekly': currentDate.setDate(currentDate.getDate() + 7); break;
                        case 'monthly': currentDate.setMonth(currentDate.getMonth() + 1); break;
                        case 'yearly': currentDate.setFullYear(currentDate.getFullYear() + 1); break;
                    }
                }
            });
            
            if (newTransactions.length > 0) {
                setTransactions(prev => [...prev, ...newTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }

            localStorage.setItem(`dhanmate-lastRecurringCheck-${currentUser.email}`, new Date().toISOString());
        };

        processRecurringTransactions();

    }, [currentUser, userData.recurringTransactions]);

    // Effect to check if tutorial should be shown
    useEffect(() => {
        if (currentUser && userData.currency) { // Ensure user is fully logged in
            const hasCompletedTutorial = localStorage.getItem('dhanmate-tutorial-completed') === 'true';
            if (!hasCompletedTutorial) {
                // Add a small delay to ensure the app has rendered before starting the tutorial
                setTimeout(() => setShowTutorial(true), 500);
            }
        }
    }, [currentUser, userData.currency]);

    const handleTutorialComplete = () => {
        localStorage.setItem('dhanmate-tutorial-completed', 'true');
        setShowTutorial(false);
    };

    const handleLogin = (user: User) => {
        localStorage.setItem('dhanmate-currentUser', user.email);
        setCurrentUser(user);
    };
    
    const handleSignOut = () => {
        localStorage.removeItem('dhanmate-currentUser');
        setCurrentUser(null);
        setUserData({ transactions: [], currency: null, goals: [], budgetCategories: [], trips: [], recurringTransactions: [] });
    };

    const handleSetCurrency = (selectedCurrency: Currency) => {
        setUserData(prev => ({ ...prev, currency: selectedCurrency }));
    };
    
    // State Setters
    const setTransactions = (updater: React.SetStateAction<Transaction[]>) => setUserData(prev => ({...prev, transactions: typeof updater === 'function' ? updater(prev.transactions) : updater,}));
    const setGoals = (updater: React.SetStateAction<Goal[]>) => setUserData(prev => ({ ...prev, goals: typeof updater === 'function' ? updater(prev.goals) : updater }));
    const setBudgetCategories = (updater: React.SetStateAction<BudgetCategory[]>) => setUserData(prev => ({ ...prev, budgetCategories: typeof updater === 'function' ? updater(prev.budgetCategories) : updater }));
    const setTrips = (updater: React.SetStateAction<Trip[]>) => setUserData(prev => ({ ...prev, trips: typeof updater === 'function' ? updater(prev.trips) : updater }));
    const setRecurringTransactions = (updater: React.SetStateAction<RecurringTransaction[]>) => setUserData(prev => ({ ...prev, recurringTransactions: typeof updater === 'function' ? updater(prev.recurringTransactions) : updater }));

    // Transaction Handlers
    const saveTransaction = (transactionData: Omit<Transaction, 'id'> | Transaction) => {
        if ('id' in transactionData) {
            setTransactions(prev => prev.map(t => t.id === transactionData.id ? transactionData : t));
        } else {
            const newTransaction = { ...transactionData, id: new Date().toISOString() };
            setTransactions(prev => [newTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    };
    const deleteTransaction = (transactionId: string) => setTransactions(prev => prev.filter(t => t.id !== transactionId));

    // Goal Handlers
    const handleAddGoal = (goal: Omit<Goal, 'id' | 'currentAmount'>) => setGoals(prev => [...prev, { ...goal, id: new Date().toISOString(), currentAmount: 0 }]);
    const handleUpdateGoal = (goalId: string, updatedData: { name: string; targetAmount: number }) => setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updatedData } : g));
    const handleUpdateGoalAmount = (goalId: string, amount: number) => setGoals(prev => prev.map(g => g.id === goalId ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) } : g));
    const handleDeleteGoal = (goalId: string) => setGoals(prev => prev.filter(g => g.id !== goalId));

    // Budget Category Handlers
    const handleAddBudgetCategory = (category: Omit<BudgetCategory, 'id'>) => setBudgetCategories(prev => [...prev, { ...category, id: new Date().toISOString() }]);
    const handleUpdateBudgetCategory = (categoryId: string, updatedData: { name: string; amount: number; carryOver: boolean }) => setBudgetCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updatedData, isDefault: false } : c));
    const handleDeleteBudgetCategory = (categoryId: string) => setBudgetCategories(prev => prev.filter(c => c.id !== categoryId));
    const handleSaveOverallBudget = (newTotalBudget: number) => {
        const currentTotalBudget = userData.budgetCategories
            .filter(c => EXPENSE_CATEGORIES.includes(c.name))
            .reduce((sum, cat) => sum + cat.amount, 0);

        if (currentTotalBudget > 0) {
            // Proportional scaling for existing budgets
            const scalingFactor = newTotalBudget / currentTotalBudget;
            setBudgetCategories(prev =>
                prev.map(cat => {
                    // Only scale expense categories
                    if (EXPENSE_CATEGORIES.includes(cat.name)) {
                        return {
                            ...cat,
                            amount: parseFloat((cat.amount * scalingFactor).toFixed(2)),
                        };
                    }
                    return cat;
                })
            );
        } else {
            // Even distribution for a new budget
            const defaultExpenseCategories = new Set(EXPENSE_CATEGORIES);
            const budgetPerCategory = parseFloat((newTotalBudget / defaultExpenseCategories.size).toFixed(2));
            setBudgetCategories(prev =>
                prev.map(cat => {
                    if (defaultExpenseCategories.has(cat.name)) {
                        return { ...cat, amount: budgetPerCategory };
                    }
                    return cat;
                })
            );
        }
    };

    // Trip Handlers
    const handleSaveTrip = (tripData: Omit<Trip, 'id' | 'expenses' | 'status'> | Trip) => {
        if ('id' in tripData) { // Editing existing trip
            setTrips(prev => prev.map(t => t.id === tripData.id ? { ...t, ...tripData } : t));
        } else { // Adding new trip
            const newTrip: Trip = { ...tripData, id: new Date().toISOString(), expenses: [], status: 'active' };
            setTrips(prev => [newTrip, ...prev]);
        }
    };
    const handleAddTripExpense = (tripId: string, expenseData: Omit<TripExpense, 'id' | 'tripId'>) => {
        const newExpense: TripExpense = { ...expenseData, id: new Date().toISOString(), tripId };
        setTrips(prev => prev.map(t => t.id === tripId ? { ...t, expenses: [newExpense, ...t.expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) } : t));
    };
    const handleEndTrip = (tripId: string) => {
        const tripToEnd = userData.trips.find(t => t.id === tripId);
        if (tripToEnd) {
            setCompletedTrip(tripToEnd);
            setTrips(prev => prev.map(t => t.id === tripId ? { ...t, status: 'completed' } : t));
        }
    };
    const handleSelectTrip = (tripId: string) => {
        setSelectedTripId(tripId);
        setActiveView('travel');
    };

    // Recurring Transaction Handlers
    const handleSaveRecurringTransaction = (rtData: Omit<RecurringTransaction, 'id'> | RecurringTransaction) => {
        if ('id' in rtData) {
            setRecurringTransactions(prev => prev.map(rt => rt.id === rtData.id ? rtData : rt));
        } else {
            const newRt = { ...rtData, id: new Date().toISOString() };
            setRecurringTransactions(prev => [newRt, ...prev]);
        }
    };
    const handleDeleteRecurringTransaction = (rtId: string) => {
        setRecurringTransactions(prev => prev.filter(rt => rt.id !== rtId));
    };

    // Navigation Handler
    const handleNavigateToBudget = () => {
        setActiveView('budget');
    };


    // Memos for calculated data
    const financialSummary = useMemo(() => ({
        income: userData.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: userData.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        balance: userData.transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    }), [userData.transactions]);
    
    const budgetSummary = useMemo(() => {
        const totalBudget = userData.budgetCategories.reduce((sum, cat) => sum + cat.amount, 0);
        const today = new Date();
        const expensesThisMonth = userData.transactions.filter(t => new Date(t.date).getMonth() === today.getMonth() && new Date(t.date).getFullYear() === today.getFullYear() && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalBudget, expensesThisMonth, budgetRemaining: totalBudget - expensesThisMonth };
    }, [userData.transactions, userData.budgetCategories]);
    
    const selectedTrip = useMemo(() => {
        if (!selectedTripId) return null;
        return userData.trips.find(trip => trip.id === selectedTripId) || null;
    }, [selectedTripId, userData.trips]);
    
    const activeTrips = useMemo(() => userData.trips.filter(t => t.status === 'active'), [userData.trips]);

    const handleFabClick = () => {
        // If in travel view with exactly one active trip, add expense to that trip
        if (activeView === 'travel' && !selectedTripId && activeTrips.length === 1) {
            setIsAddingExpenseFromTravelView(true);
            setSelectedTripId(activeTrips[0].id);
            setEditingTripExpense('new');
        } 
        // If already inside a specific trip view, add expense to that trip
        else if (selectedTrip) {
            setEditingTripExpense('new');
        } 
        // Default action: toggle the fab menu
        else {
            setIsFabMenuOpen(prev => !prev);
        }
    };

    const handleOpenSingleTransactionModal = () => {
        setEditingTransaction('new');
        setIsFabMenuOpen(false);
    };
    
    const handleOpenRecurringTransactionModal = () => {
        setEditingRecurringTransaction('new');
        setIsFabMenuOpen(false);
    };

    const handleCloseTripExpenseModal = () => {
        setEditingTripExpense(null);
        if (isAddingExpenseFromTravelView) {
            setSelectedTripId(null);
            setIsAddingExpenseFromTravelView(false);
        }
    };


    const renderContent = () => {
        if (selectedTrip) {
            return <TripDetail trip={selectedTrip} currency={userData.currency!} onEndTrip={handleEndTrip} onBack={() => setSelectedTripId(null)} />;
        }
        switch (activeView) {
            case 'dashboard': return <Dashboard 
                summary={financialSummary} 
                budgetSummary={budgetSummary} 
                currency={userData.currency!} 
                transactions={userData.transactions} 
                onEditTransaction={(tx) => setEditingTransaction(tx)} 
                onDeleteTransaction={deleteTransaction}
                recurringTransactions={userData.recurringTransactions}
                onDeleteRecurringTransaction={handleDeleteRecurringTransaction}
                onEditRecurringTransaction={(rt) => setEditingRecurringTransaction(rt)}
                onNavigateToBudget={handleNavigateToBudget}
                onEditOverallBudget={() => setIsOverallBudgetModalOpen(true)}
            />;
            case 'travel': return <TravelMode trips={userData.trips} onSelectTrip={handleSelectTrip} onNewTrip={() => setEditingTrip('new')} />;
            case 'goals': return <Goals goals={userData.goals} onAddGoal={handleAddGoal} onUpdateGoalAmount={handleUpdateGoalAmount} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} currency={userData.currency!} />;
            case 'aicoach': return <AiCoach 
                transactions={userData.transactions}
                goals={userData.goals}
                trips={userData.trips}
                budget={budgetSummary.totalBudget}
                summary={{
                    income: financialSummary.income,
                    expenses: budgetSummary.expensesThisMonth,
                    budgetRemaining: budgetSummary.budgetRemaining,
                }}
                currency={userData.currency!} 
            />;
            case 'budget': return <Budget 
                budgetCategories={userData.budgetCategories} 
                transactions={userData.transactions} 
                currency={userData.currency!} 
                onAddCategory={handleAddBudgetCategory} 
                onUpdateCategory={handleUpdateBudgetCategory} 
                onDeleteCategory={handleDeleteBudgetCategory}
                budgetSummary={budgetSummary}
                onEditOverallBudget={() => setIsOverallBudgetModalOpen(true)}
             />;
            default: return null;
        }
    };

    if (!currentUser) return <Login onLogin={handleLogin} />;
    if (!userData.currency) return <CurrencySetupModal onCurrencySelect={handleSetCurrency} />;

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans dark:bg-gray-900 dark:text-gray-200">
            {showTutorial && <AppTutorial onComplete={handleTutorialComplete} />}
            <Navigation activeView={activeView} setActiveView={(view) => { setActiveView(view); setSelectedTripId(null); }} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={currentUser} onSignOut={handleSignOut} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
                     {renderContent()}
                </main>
            </div>
            
            {isFabMenuOpen && !selectedTrip && (
                <div 
                    className="fixed inset-0 bg-black/30 z-30" 
                    onClick={() => setIsFabMenuOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6 flex flex-col items-end">
                 {isFabMenuOpen && !selectedTrip && (
                    <div className="flex flex-col items-end space-y-3 mb-3" role="menu">
                        <button 
                            id="fab-add-recurring"
                            onClick={handleOpenRecurringTransactionModal} 
                            className="flex items-center space-x-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-4 py-2 rounded-xl shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                            role="menuitem"
                        >
                            <RepeatIcon className="h-5 w-5" />
                            <span className="whitespace-nowrap">Add Recurring</span>
                        </button>
                        <button 
                            id="fab-add-single"
                            onClick={handleOpenSingleTransactionModal} 
                            className="flex items-center space-x-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold px-4 py-2 rounded-xl shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                            role="menuitem"
                        >
                            <PlusCircleIcon className="h-5 w-5" />
                            <span className="whitespace-nowrap">Add Single</span>
                        </button>
                    </div>
                )}
                <button
                    id="fab-add-transaction"
                    onClick={handleFabClick}
                    className="flex items-center justify-center bg-emerald-500 text-white font-semibold rounded-full h-14 px-4 space-x-2 shadow-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 ease-in-out hover:scale-110 lg:h-auto lg:w-auto lg:px-5 lg:py-3"
                    aria-haspopup={!selectedTrip}
                    aria-expanded={isFabMenuOpen && !selectedTrip}
                    aria-label={selectedTrip ? "Add Trip Expense" : "Add Transaction"}
                >
                    <PlusIcon className={`h-6 w-6 transition-transform duration-200 ${isFabMenuOpen && !selectedTrip ? 'rotate-45' : ''}`} />
                    <span>{selectedTrip ? "Add Expense" : "Add Transaction"}</span>
                </button>
            </div>


            {editingTransaction && (
                <TransactionModal
                    onClose={() => setEditingTransaction(null)}
                    onSave={saveTransaction}
                    currency={userData.currency!}
                    transaction={typeof editingTransaction === 'object' ? editingTransaction : undefined}
                    budgetCategories={userData.budgetCategories}
                />
            )}
            {editingTrip && (
                <TripModal 
                    onClose={() => setEditingTrip(null)} 
                    onSave={handleSaveTrip} 
                    trip={typeof editingTrip === 'object' ? editingTrip : undefined} 
                />
            )}
            {editingTripExpense && selectedTrip && (
                <TripExpenseModal
                    onClose={handleCloseTripExpenseModal}
                    onSave={(expense) => handleAddTripExpense(selectedTrip.id, expense)}
                    currency={userData.currency!}
                />
            )}
            {completedTrip && (
                <TripSummaryModal
                    trip={completedTrip}
                    currency={userData.currency!}
                    onClose={() => setCompletedTrip(null)}
                />
            )}
            {editingRecurringTransaction && (
                <RecurringTransactionModal
                    onClose={() => setEditingRecurringTransaction(null)}
                    onSave={handleSaveRecurringTransaction}
                    recurringTransaction={typeof editingRecurringTransaction === 'object' ? editingRecurringTransaction : undefined}
                    budgetCategories={userData.budgetCategories}
                />
            )}
            {isOverallBudgetModalOpen && (
                <OverallBudgetModal
                    onClose={() => setIsOverallBudgetModalOpen(false)}
                    onSave={(newTotal) => {
                        handleSaveOverallBudget(newTotal);
                        setIsOverallBudgetModalOpen(false);
                    }}
                    currency={userData.currency!}
                    currentTotalBudget={budgetSummary.totalBudget}
                />
            )}
            <BottomNavigation activeView={activeView} setActiveView={(view) => { setActiveView(view); setSelectedTripId(null); }} />
        </div>
    );
};

export default App;