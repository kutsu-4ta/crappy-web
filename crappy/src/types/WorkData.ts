export type WorkSession = {
  id: string;
  date: string; // "YYYY-MM-DD"
  hours: number;
  note?: string;
};

export type AppSettings = {
  targetMin: number;
  targetMax: number;
};

export type ExpenseTag = 'entertainment' | 'equipment' | 'transport' | 'communication' | 'other';

export type Expense = {
  id: string;
  date: string; // "YYYY-MM-DD"
  amount: number;
  description: string;
  tag: ExpenseTag;
};

export interface DashboardStats {
  currentTotal: number;
  remainingBusinessDays: number;
  totalBusinessDays: number;
  businessDaysElapsed: number;
  estimatedTotal: number;
  requiredDailyHours: number;   // to hit targetMin
  upperLimitDailyHours: number; // max per day to stay under targetMax
  targetMin: number;
  targetMax: number;
  towardsMin: number;  // hours remaining to hit min
  towardsMax: number;  // hours remaining before hitting max
  dailyAverage: number;
}

export type ChartDataPoint = {
  day: number;
  date: string;
  actual?: number;
  forecast?: number;
  range: [number, number];
};
