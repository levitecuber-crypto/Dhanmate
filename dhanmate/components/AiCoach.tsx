import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Goal, Currency, Trip, ChatMessage } from '../types';
import { getAiCoachResponse } from '../services/geminiService';
import { SendIcon } from './icons';

interface AiCoachProps {
    transactions: Transaction[];
    goals: Goal[];
    trips: Trip[];
    budget: number;
    summary: {
        income: number;
        expenses: number;
        budgetRemaining: number;
    };
    currency: Currency;
}

const AiCoach: React.FC<AiCoachProps> = ({ transactions, goals, trips, budget, summary, currency }) => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setChatHistory([{
            role: 'model',
            text: `Hello! I'm your DhanMate assistant. How can I help you with your finances today? You can ask me for advice on your budget, spending, or savings goals.`
        }]);
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isLoading]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedInput = userInput.trim();
        if (!trimmedInput || isLoading) return;

        setError(null);
        const newUserMessage: ChatMessage = { role: 'user', text: trimmedInput };
        const updatedChatHistory = [...chatHistory, newUserMessage];
        
        setChatHistory(updatedChatHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const responseText = await getAiCoachResponse(
                updatedChatHistory,
                transactions,
                goals,
                trips,
                budget,
                summary,
                currency
            );
            const newModelMessage: ChatMessage = { role: 'model', text: responseText };
            setChatHistory(prev => [...prev, newModelMessage]);
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again in a moment." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col h-full pb-24 lg:pb-0">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4 px-4 sm:px-0">AI Coach</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md flex-1 flex flex-col overflow-hidden">
                <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {chatHistory.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg px-4 py-2 rounded-2xl ${
                                message.role === 'user' 
                                ? 'bg-emerald-500 text-white rounded-br-none' 
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                            }`}>
                                <div>
                                     {message.text.split('\n\n').map((paragraph, i) => <p key={i} className="my-2">{paragraph}</p>)}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                            <div className="max-w-lg px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-500 px-6 pb-2">{error}</p>}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask about your finances..."
                            disabled={isLoading}
                            className="flex-1 block w-full rounded-full border-gray-300 dark:border-gray-600 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !userInput.trim()}
                            className="inline-flex items-center justify-center rounded-full h-10 w-10 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:bg-emerald-300 dark:disabled:bg-emerald-800 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AiCoach;
