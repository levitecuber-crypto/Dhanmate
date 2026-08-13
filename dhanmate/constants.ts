import { Category, Currency } from './types';

export const CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Travel',
  'Income',
  'Other',
];

export const EXPENSE_CATEGORIES: Category[] = [
  'Food',
  'Transport',
  'Bills',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Travel',
  'Other',
];

export const INCOME_CATEGORIES: Category[] = ['Income', 'Other'];


export const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'United States Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[0];

export const PRESET_AVATARS: string[] = [
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjOGEyYmUyIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNGEwMGUwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI1MCIgcnk9IjUwIiBmaWxsPSJ1cmwoI2EpIiAvPjxnIGZpbGw9IndoaXRlIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjQwIiByPSIxNSIvPjxwYXRoIGQ9Ik01MCA2MCBDIDM1IDYwLCAzNSA5MCwgNTAgOTAgQyA2NSA5MCwgNjUgNjAsIDUwIDYwIFoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIC01KSIvPjwvZz48L3N2Zz4=',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjJjNTVlIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTRiOGE2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI1MCIgcnk9IjUwIiBmaWxsPSJ1cmwoI2EpIiAvPjxwYXRoIGQ9Ik0yNSA3NSBMNTAgMzUgTDc1IDc1IFogTTQ1IDc1IEw2MCA1NSBMNzUgNzUgWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC44Ii8+PHBhdGggZD0iTTI1IDc1IEw1MCAzNSBMNzUgNzUgWiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIzIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjM2I4MmY2Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjNjM2NmYxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI1MCIgcnk9IjUwIiBmaWxsPSJ1cmwoI2EpIiAvPjxwYXRoIGQ9Ik0gMzAgNzUgUSA1MCA2NSwgNzAgNzUgTCA3MCAzMCBRIDEwIDQwLCAzMCAzMCBaIE0gNTAgMzUgTCA1MCA3MCBNIDM1IDMyIEwgNjUgMzIiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZWM0ODk5Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZjQzZjVlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI1MCIgcnk9IjUwIiBmaWxsPSJ1cmwoI2EpIiAvPjxwYXRoIGQ9Ik01MCAzMCBDIDI1IDEwLCAyNSA0MCwgNTAgNjAgQyA3NSA0MCwgNzUgMTAsIDUwIDMwIFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwIiB5MT0iMSIgeDI9IjEiIHkyPSIwIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNDMzOGNhIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMWUxYjRiIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHJ4PSI1MCIgcnk9IjUwIiBmaWxsPSJ1cmwoI2EpIiAvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIC01KSByb3RhdGUoLTQ1IDUwIDUwKSI+PHBhdGggZD0iTSA1MCAyMCBMIDY1IDUwIEwgNTggNTAgTCA1OCA4MCBMIDQyIDgwIEwgNDIgNTAgTCAzNSA1MCBaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0gNTAgODAgTCA0MCA5MCBMIDYwIDkwIFoiIGZpbGw9IiNmOTczMTYiLz48L2c+PC9zdmc+'
];