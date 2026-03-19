import { isSaturday, isSunday, eachDayOfInterval, endOfMonth, format } from 'date-fns';
import { JP_HOLIDAYS } from './holidays';

export function isBusinessDay(date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return !isSaturday(date) && !isSunday(date) && !JP_HOLIDAYS.has(dateStr);
}

export function getBusinessDays(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end }).filter(isBusinessDay);
}

export function getMonthBusinessDays(year: number, month: number): Date[] {
  const start = new Date(year, month - 1, 1);
  const end = endOfMonth(start);
  return getBusinessDays(start, end);
}
