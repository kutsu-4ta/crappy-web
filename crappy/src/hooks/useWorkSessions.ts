import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import type { WorkSession } from '../types/WorkData';
import { storage } from '../lib/storage';

export function useWorkSessions() {
  const [sessions, setSessions] = useState<WorkSession[]>(() => storage.getSessions());

  const addSession = useCallback((date: Date, hours: number, note?: string) => {
    const newSession: WorkSession = {
      id: crypto.randomUUID(),
      date: format(date, 'yyyy-MM-dd'),
      hours: Math.round(hours * 100) / 100,
      note,
    };
    setSessions(prev => {
      const updated = [...prev, newSession];
      storage.saveSessions(updated);
      return updated;
    });
    return newSession;
  }, []);

  const updateSession = useCallback((id: string, hours: number) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, hours: Math.round(hours * 100) / 100 } : s);
      storage.saveSessions(updated);
      return updated;
    });
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      storage.saveSessions(updated);
      return updated;
    });
  }, []);

  // Get sessions for a specific month
  const getMonthSessions = useCallback((year: number, month: number): WorkSession[] => {
    const prefix = format(new Date(year, month - 1, 1), 'yyyy-MM');
    return sessions.filter(s => s.date.startsWith(prefix));
  }, [sessions]);

  // Get daily totals: { "YYYY-MM-DD": totalHours }
  const getDailyTotals = useCallback((year: number, month: number): Record<string, number> => {
    const monthSessions = getMonthSessions(year, month);
    const totals: Record<string, number> = {};
    for (const s of monthSessions) {
      totals[s.date] = (totals[s.date] ?? 0) + s.hours;
    }
    return totals;
  }, [getMonthSessions]);

  return { sessions, addSession, updateSession, deleteSession, getMonthSessions, getDailyTotals };
}
