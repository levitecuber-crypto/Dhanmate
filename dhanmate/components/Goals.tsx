import React, { useState } from 'react';
import { Goal, Currency } from '../types';
import { TargetIcon, EditIcon, TrashIcon } from './icons';

interface GoalsProps {
    goals: Goal[];
    onAddGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
    onUpdateGoalAmount: (goalId: string, amount: number) => void;
    onUpdateGoal: (goalId: string, updatedData: { name: string; targetAmount: number }) => void;
    onDeleteGoal: (goalId: string) => void;
    currency: Currency;
}

interface GoalItemProps {
    goal: Goal;
    currency: Currency;
    onUpdateGoalAmount: (goalId: string, amount: number) => void;
    onUpdateGoal: (goalId: string, updatedData: { name: string; targetAmount: number }) => void;
    onDeleteGoal: (goalId: string) => void;
}

const GoalItem: React.FC<GoalItemProps> = ({ goal, currency, onUpdateGoalAmount, onUpdateGoal, onDeleteGoal }) => {
    const [isAddingFunds, setIsAddingFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(goal.name);
    const [editedTargetAmount, setEditedTargetAmount] = useState(String(goal.targetAmount));

    const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
    
    const handleAddFunds = () => {
        const amount = parseFloat(amountToAdd);
        if (!isNaN(amount) && amount > 0) {
            onUpdateGoalAmount(goal.id, amount);
            setAmountToAdd('');
            setIsAddingFunds(false);
        } else {
            alert('Please enter a valid positive number.');
        }
    };

    const handleSaveEdit = () => {
        const amount = parseFloat(editedTargetAmount);
        if (editedName.trim() && !isNaN(amount) && amount > 0) {
            if (amount < goal.currentAmount) {
                alert("Target amount cannot be less than the current saved amount.");
                return;
            }
            onUpdateGoal(goal.id, { name: editedName.trim(), targetAmount: amount });
            setIsEditing(false);
        } else {
            alert('Please enter a valid name and target amount.');
        }
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete the goal "${goal.name}"? This action cannot be undone.`)) {
            onDeleteGoal(goal.id);
        }
    };

    const handleCancelEdit = () => {
        setEditedName(goal.name);
        setEditedTargetAmount(String(goal.targetAmount));
        setIsEditing(false);
    }

    if (isEditing) {
        return (
            <div className="p-4 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 mb-3 space-y-3">
                 <input 
                    type="text" 
                    value={editedName}
                    onChange={e => setEditedName(e.target.value)}
                    placeholder="Goal Name"
                    className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                />
                <input 
                    type="number" 
                    value={editedTargetAmount}
                    onChange={e => setEditedTargetAmount(e.target.value)}
                    placeholder={`Target Amount (${currency.symbol})`}
                    className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={handleCancelEdit} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleSaveEdit} className="px-3 py-1 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">Save</button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-3">
            <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 break-words pr-2">{goal.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {currency.symbol}{goal.currentAmount.toLocaleString()} / <span className="font-medium text-gray-700 dark:text-gray-300">{currency.symbol}{goal.targetAmount.toLocaleString()}</span>
                    </p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-emerald-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Edit goal">
                        <EditIcon className="h-4 w-4" />
                    </button>
                    <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Delete goal">
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 my-2">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>

            {isAddingFunds ? (
                <div className="mt-3 space-y-2">
                    <input 
                        type="number"
                        value={amountToAdd}
                        onChange={(e) => setAmountToAdd(e.target.value)}
                        placeholder={`Amount to add (${currency.symbol})`}
                        className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFunds()}
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsAddingFunds(false)} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button onClick={handleAddFunds} className="px-3 py-1 text-sm font-medium text-white bg-emerald-500 rounded-md hover:bg-emerald-600">Save</button>
                    </div>
                </div>
            ) : (
                <div className="text-right">
                    <button onClick={() => setIsAddingFunds(true)} className="text-emerald-500 hover:text-emerald-600 font-semibold text-sm">
                        + Add Savings
                    </button>
                </div>
            )}
        </div>
    );
};

const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onUpdateGoalAmount, onUpdateGoal, onDeleteGoal, currency }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');

    const handleAddGoal = () => {
        const amount = parseFloat(targetAmount);
        if (name && amount > 0) {
            onAddGoal({ name, targetAmount: amount });
            setName('');
            setTargetAmount('');
            setIsAdding(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200">Savings Goals</h3>
                <button onClick={() => setIsAdding(!isAdding)} className="text-emerald-500 hover:text-emerald-600 font-semibold text-sm">
                    {isAdding ? 'Cancel' : '+ New Goal'}
                </button>
            </div>
            
            {isAdding && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Goal Name (e.g., New Car)"
                        className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <input 
                        type="number" 
                        value={targetAmount}
                        onChange={e => setTargetAmount(e.target.value)}
                        placeholder={`Target Amount (${currency.symbol})`}
                        className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 dark:text-white"
                    />
                    <button onClick={handleAddGoal} className="w-full bg-emerald-500 text-white font-semibold text-sm py-2 rounded-lg hover:bg-emerald-600 transition-colors">
                        Save Goal
                    </button>
                </div>
            )}
            
            {goals.length > 0 ? (
                goals.map(goal => <GoalItem key={goal.id} goal={goal} currency={currency} onUpdateGoalAmount={onUpdateGoalAmount} onUpdateGoal={onUpdateGoal} onDeleteGoal={onDeleteGoal} />)
            ) : (
                <div className="text-center py-6">
                    <TargetIcon className="h-10 w-10 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No savings goals yet.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">Set a goal to start saving!</p>
                </div>
            )}
        </div>
    );
};

export default Goals;