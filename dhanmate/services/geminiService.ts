






import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Transaction, Goal, Currency, Trip, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const transactionSchema = {
    type: Type.OBJECT,
    properties: {
        amount: {
            type: Type.NUMBER,
            description: "The numeric amount of the transaction.",
        },
        description: {
            type: Type.STRING,
            description: "A brief description of the transaction (e.g., 'Groceries at Walmart', 'Dinner with friends').",
        },
        category: {
            type: Type.STRING,
            description: "The most appropriate category for the transaction.",
            enum: ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Health', 'Education', 'Travel', 'Other'],
        },
    },
    required: ["amount", "description", "category"],
};

export const parseReceipt = async (imageDataUrl: string): Promise<Partial<Omit<Transaction, 'id' | 'date' | 'type'>>> => {
    const base64Data = imageDataUrl.split(',')[1];
    
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
        },
    };
    const textPart = {
        text: `Analyze this receipt image and extract the transaction details. Identify the total amount, provide a concise description (like the store name and what was purchased), and classify it into one of the specified categories.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: transactionSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Failed to parse receipt. The response was empty.");
    }

    try {
        return JSON.parse(jsonText) as Partial<Omit<Transaction, 'id' | 'date' | 'type'>>;
    } catch (e) {
        console.error("Error parsing JSON from Gemini:", e);
        throw new Error("Could not understand the receipt details. Please enter them manually.");
    }
};

export const parseVoiceCommand = async (command: string): Promise<Partial<Omit<Transaction, 'id' | 'date' | 'type'>>> => {
    const prompt = `Parse the following voice command to extract transaction details: "${command}". Identify the total amount, create a concise description, and classify it into one of the specified categories.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: transactionSchema,
        },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Failed to parse voice command. The response was empty.");
    }

    try {
        return JSON.parse(jsonText) as Partial<Omit<Transaction, 'id' | 'date' | 'type'>>;
    } catch (e) {
        console.error("Error parsing JSON from Gemini:", e);
        throw new Error("Could not understand the voice command. Please enter the details manually.");
    }
};


export const getAiCoachResponse = async (
    chatHistory: ChatMessage[],
    transactions: Transaction[],
    goals: Goal[],
    trips: Trip[],
    budget: number,
    summary: {
        income: number;
        expenses: number;
        budgetRemaining: number;
    },
    currency: Currency
): Promise<string> => {
    const recentTransactions = transactions.slice(0, 20).map(t => `${t.date}: ${t.type} of ${currency.symbol}${t.amount} for ${t.description} in ${t.category}`).join('\n');
    const userGoals = goals.length > 0 ? goals.map(g => `${g.name} (Target: ${currency.symbol}${g.targetAmount}, Saved: ${currency.symbol}${g.currentAmount})`).join('\n') : 'No goals set.';
    const userTrips = trips.length > 0 ? trips.map(t => `${t.name} to ${t.destination} (${t.status}) - Budget: ${currency.symbol}${t.totalBudget}`).join('\n') : 'No trips planned or completed.';

    const systemInstruction = `
        You are a friendly and encouraging financial assistant named DhanMate.
        Your goal is to help the user with their finances by answering their questions and providing advice based on the data they've provided.
        Keep your responses conversational, concise, and helpful. Use markdown for formatting if it improves readability (e.g., lists).
        Always refer to the user's financial data to provide personalized insights.

        Here is the user's current financial context. Use this for all your responses:
        ---
        User's Financial Summary:
        - Currency: ${currency.name} (${currency.symbol})
        - Total Monthly Budget: ${currency.symbol}${budget.toLocaleString()}
        - Monthly Income: ${currency.symbol}${summary.income.toLocaleString()}
        - Expenses This Month: ${currency.symbol}${summary.expenses.toLocaleString()}
        - Amount Remaining in Budget: ${currency.symbol}${summary.budgetRemaining.toLocaleString()}
        
        User's Savings Goals:
        ${userGoals}

        User's Trips:
        ${userTrips}

        User's Last 20 Transactions:
        ${recentTransactions}
        ---
    `;

    const modelHistory = chatHistory.slice(0, -1).map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
      history: modelHistory
    });
    
    const userMessage = chatHistory[chatHistory.length - 1].text;
    
    try {
        const response = await chat.sendMessage({ message: userMessage });
        const text = response.text;
        if (!text) {
             return "I'm not sure how to respond to that. Could you ask in a different way?";
        }
        return text;
    } catch (e) {
        console.error("Gemini API error:", e);
        return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
};

export const getTripSummaryAdvice = async (trip: Trip, currency: Currency): Promise<string> => {
    const totalSpent = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
    const spendingByCategory = trip.expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const biggestCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0];

    const prompt = `
        A user just completed their "${trip.name}" to ${trip.destination}.
        - Budget: ${currency.symbol}${trip.totalBudget.toLocaleString()}
        - Total Spent: ${currency.symbol}${totalSpent.toLocaleString()}
        - Their biggest spending category was "${biggestCategory[0]}" with ${currency.symbol}${biggestCategory[1].toLocaleString()}.

        Write a single, concise, and friendly sentence of advice for their next trip based on this data. 
        For example: "You spent a bit more than planned on ${biggestCategory[0]}—next time, you could try local markets to save on costs!"
        or "Great job staying on budget! You managed your ${biggestCategory[0]} expenses well."
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const text = response.text;
    if (!text) {
        return "Have a great trip next time!";
    }
    return text;
};
