import { Category } from './types';

export const DOCS_URL = 'https://core.telegram.org/bots/api';

// A simple map of headings to the API category
export const CATEGORIES: Record<string, Category | void> = {
    'Getting updates': 'core',
    'Available types': 'core',
    'Available methods': 'core',
    'Updating messages': 'core',
    Stickers: 'stickers',
    'Inline mode': 'inline',
    Payments: 'payments',
    'Telegram Passport': 'passport',
    Games: 'game',
};
