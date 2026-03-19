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
  receiptUrl?: string;      // Firebase Storage download URL
  receiptPath?: string;     // Storage path for deletion
};

// Monthly settings override (null fields fall back to user defaults)
export type MonthSettings = {
  targetMin?: number;
  targetMax?: number;
};

// Firestore document shapes
export type AttendanceDoc = {
  month: string;           // "YYYY-MM"
  sessions: WorkSession[];
  updatedAt: unknown;      // Firestore Timestamp (serverTimestamp)
};

export type ExpenseDoc = {
  month: string;
  items: Expense[];
  updatedAt: unknown;
};

export interface DashboardStats {
  currentTotal: number;
  remainingBusinessDays: number;
  totalBusinessDays: number;
  businessDaysElapsed: number;
  estimatedTotal: number;
  requiredDailyHours: number;
  upperLimitDailyHours: number;
  targetMin: number;
  targetMax: number;
  towardsMin: number;
  towardsMax: number;
  dailyAverage: number;
}

export type ChartDataPoint = {
  day: number;
  date: string;
  actual?: number;
  forecast?: number;
  range: [number, number];
};
