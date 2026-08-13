export type TransactionType = 'income' | 'expense';

export type Category = string;

// FIX: Added missing PaymentMethod type for use in icons.tsx and potentially other components.
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'Cash';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  // FIX: Added optional paymentMethod property to support transaction details.
  paymentMethod?: PaymentMethod;
  recurringTransactionId?: string;
}

export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export interface User {
    email: string;
    password?: string; // Stored as a simple string for this simulation
    username: string;
    profileImage: string; // URL or base64 string
    notificationsEnabled: boolean;
}

// FIX: Added missing Goal type for use in Goals.tsx and AiCoach.tsx.
export interface Goal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
}

// FIX: Added missing BudgetCategory type for use in CategoryBudgets.tsx.
export interface BudgetCategory {
    id: string;
    name: Category;
    amount: number;
    isDefault: boolean;
    carryOver?: boolean;
}

export interface TripExpense {
    id: string;
    tripId: string;
    date: string;
    amount: number;
    category: Category;
    description: string;
}

export interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    totalBudget: number;
    expenses: TripExpense[];
    status: 'active' | 'completed';
}

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // Optional YYYY-MM-DD
  frequency: Frequency;
  amount: number;
  type: TransactionType;
  category: Category;
  description: string;
  paymentMethod?: PaymentMethod;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
