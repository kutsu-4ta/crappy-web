import {
    differenceInBusinessDays,
    endOfMonth,
    startOfDay,
    eachDayOfInterval,
    isSaturday,
    isSunday
} from 'date-fns';
import type {DashboardStats} from "../types/workData";

// 本来はAPIやJSONから取得する祝日リスト（2024年の例）
const HOLIDAYS = [
    '2024-01-01', '2024-01-08', '2024-02-11', '2024-02-12', '2024-02-23',
    '2024-03-20', '2024-04-29', '2024-05-03', '2024-05-04', '2024-05-05', '2024-05-06'
];


export const calculateDashboardStats = (
    currentTotal: number,
    targetMin: number,
    targetMax: number
): DashboardStats => {
    const today = startOfDay(new Date());
    const monthEnd = endOfMonth(today);

    // 今日から月末までの全日付を取得
    const daysInterval = eachDayOfInterval({start: today, end: monthEnd});

    // 土日・祝日を除外した「真の残り営業日」
    const remainingBusinessDays = daysInterval.filter(day => {
        const dateStr = day.toISOString().split('T')[0];
        return !isSaturday(day) && !isSunday(day) && !HOLIDAYS.includes(dateStr);
    }).length;

    const estimatedTotal = currentTotal + (remainingBusinessDays * 8);

    const requiredDailyHours = remainingBusinessDays > 0
        ? Math.max(0, (targetMin - currentTotal) / remainingBusinessDays)
        : 0;

    const upperLimitWarning = remainingBusinessDays > 0
        ? Math.max(0, (targetMax - currentTotal) / remainingBusinessDays)
        : 0;

    return {
        remainingBusinessDays,
        estimatedTotal: Number(estimatedTotal.toFixed(1)),
        requiredDailyHours: Number(requiredDailyHours.toFixed(1)),
        upperLimitWarning: Number(upperLimitWarning.toFixed(1)),
        targetMax,
        targetMin,
    };
};