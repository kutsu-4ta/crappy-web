import type { WorkSession, AppSettings, Expense } from '../types/WorkData';

const SESSIONS_KEY = 'crappy_sessions';
const SETTINGS_KEY = 'crappy_settings';
const EXPENSES_KEY = 'crappy_expenses';

const DEFAULT_SETTINGS: AppSettings = { targetMin: 140, targetMax: 180 };

function parseJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const storage = {
  getSessions: (): WorkSession[] => parseJSON(SESSIONS_KEY, []),
  saveSessions: (sessions: WorkSession[]): void => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },
  getSettings: (): AppSettings => parseJSON(SETTINGS_KEY, DEFAULT_SETTINGS),
  saveSettings: (settings: AppSettings): void => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  getExpenses: (): Expense[] => parseJSON(EXPENSES_KEY, []),
  saveExpenses: (expenses: Expense[]): void => {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  },
};
