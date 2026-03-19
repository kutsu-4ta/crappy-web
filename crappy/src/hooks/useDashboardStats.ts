import { format, eachDayOfInterval, startOfMonth, endOfMonth, startOfDay } from 'date-fns';
import type { DashboardStats, ChartDataPoint, AppSettings } from '../types/WorkData';
import { getMonthBusinessDays, isBusinessDay, getBusinessDays } from '../lib/businessDays';

export function calculateDashboardStats(
  dailyTotals: Record<string, number>,
  settings: AppSettings,
  today: Date = new Date()
): DashboardStats {
  const { targetMin, targetMax } = settings;
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  const allBusinessDays = getMonthBusinessDays(year, month);
  const totalBusinessDays = allBusinessDays.length;

  const monthStart = startOfMonth(today);
  const todayStart = startOfDay(today);

  // Business days elapsed (from month start to today inclusive)
  const elapsedDays = getBusinessDays(monthStart, todayStart);
  const businessDaysElapsed = elapsedDays.length;

  // Remaining business days (from tomorrow to month end)
  const tomorrow = new Date(todayStart);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthEnd = endOfMonth(today);
  const remainingDays = tomorrow <= monthEnd ? getBusinessDays(tomorrow, monthEnd) : [];
  const remainingBusinessDays = remainingDays.length;

  // Current total hours
  const currentTotal = Object.values(dailyTotals).reduce((sum, h) => sum + h, 0);

  // Daily average (based on elapsed business days)
  const dailyAverage = businessDaysElapsed > 0 ? currentTotal / businessDaysElapsed : 0;

  // Estimated total at month end
  const estimatedTotal = currentTotal + dailyAverage * remainingBusinessDays;

  // Required pace
  const towardsMin = Math.max(0, targetMin - currentTotal);
  const towardsMax = Math.max(0, targetMax - currentTotal);

  const requiredDailyHours = remainingBusinessDays > 0
    ? Math.max(0, towardsMin / remainingBusinessDays)
    : 0;

  const upperLimitDailyHours = remainingBusinessDays > 0
    ? Math.max(0, towardsMax / remainingBusinessDays)
    : 0;

  return {
    currentTotal: Math.round(currentTotal * 10) / 10,
    remainingBusinessDays,
    totalBusinessDays,
    businessDaysElapsed,
    estimatedTotal: Math.round(estimatedTotal * 10) / 10,
    requiredDailyHours: Math.round(requiredDailyHours * 10) / 10,
    upperLimitDailyHours: Math.round(upperLimitDailyHours * 10) / 10,
    targetMin,
    targetMax,
    towardsMin: Math.round(towardsMin * 10) / 10,
    towardsMax: Math.round(towardsMax * 10) / 10,
    dailyAverage: Math.round(dailyAverage * 10) / 10,
  };
}

export function buildChartData(
  dailyTotals: Record<string, number>,
  settings: AppSettings,
  today: Date = new Date()
): ChartDataPoint[] {
  const { targetMin, targetMax } = settings;
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const todayStr = format(today, 'yyyy-MM-dd');

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const allBusinessDays = getMonthBusinessDays(year, month);
  const totalBusinessDays = allBusinessDays.length;

  // Cumulative actual up to today
  let cumulativeActual = 0;
  const cumulativeByDay: Record<string, number> = {};
  for (const day of allDays) {
    const dayStr = format(day, 'yyyy-MM-dd');
    if (dayStr <= todayStr) {
      cumulativeActual += (dailyTotals[dayStr] ?? 0);
      cumulativeByDay[dayStr] = cumulativeActual;
    }
  }

  // Daily average for forecast
  const monthStart2 = startOfMonth(today);
  const todayStart = startOfDay(today);
  const elapsedBizDays = getBusinessDays(monthStart2, todayStart).length;
  const currentTotal = Object.values(dailyTotals).reduce((s, h) => s + h, 0);
  const dailyAvg = elapsedBizDays > 0 ? currentTotal / elapsedBizDays : 0;

  // Build business days count up to each day (for target zone scaling)
  let bizDaysCount = 0;
  const result: ChartDataPoint[] = [];

  let forecastAccumulated = currentTotal;

  for (const day of allDays) {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayNum = day.getDate();

    if (isBusinessDay(day)) bizDaysCount++;

    const ratio = totalBusinessDays > 0 ? bizDaysCount / totalBusinessDays : 0;
    const targetLower = targetMin * ratio;
    const targetUpper = targetMax * ratio;

    const isPast = dayStr < todayStr;
    const isToday = dayStr === todayStr;
    const isFuture = dayStr > todayStr;

    let actual: number | undefined = undefined;
    let forecast: number | undefined = undefined;

    if (isPast || isToday) {
      actual = cumulativeByDay[dayStr] ?? (isPast ? cumulativeActual : 0);
    }

    if (isToday) {
      forecast = currentTotal;
    } else if (isFuture && isBusinessDay(day)) {
      forecastAccumulated += dailyAvg;
      forecast = Math.round(forecastAccumulated * 10) / 10;
    } else if (isFuture) {
      // Non-business day: carry forward the last forecast value
      forecast = Math.round(forecastAccumulated * 10) / 10;
    }

    result.push({
      day: dayNum,
      date: dayStr,
      actual,
      forecast,
      range: [Math.round(targetLower * 10) / 10, Math.round(targetUpper * 10) / 10],
    });
  }

  return result;
}
