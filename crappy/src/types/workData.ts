export type WorkLog = {
    date: string;
    startTime: string;
    endTime: string;
    breakTime: number;
    totalHours: number;
    note: string;
};

export interface DashboardStats {
    remainingBusinessDays: number;
    estimatedTotal: number;
    requiredDailyHours: number;
    upperLimitWarning: number;
    targetMin: number;
    targetMax: number;
}