import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import type { WorkSession } from '../types/WorkData';
import { subscribeToAttendance, saveAttendanceSessions } from '../lib/firestoreService';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export function useWorkSessions() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep a stable ref to the latest sessions for use inside callbacks
  const sessionsRef = useRef<WorkSession[]>([]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const currentMonth = format(new Date(), 'yyyy-MM');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToAttendance(user.uid, currentMonth, (fetched) => {
      setSessions(fetched);
      setLoading(false);
    });
    return unsub;
  }, [user, currentMonth]);

  const addSession = useCallback(async (date: Date, hours: number, note?: string) => {
    if (!user) return;
    const newSession: WorkSession = {
      id: crypto.randomUUID(),
      date: format(date, 'yyyy-MM-dd'),
      hours: Math.round(hours * 100) / 100,
      note,
    };
    const updated = [...sessionsRef.current, newSession];
    setSessions(updated);
    await saveAttendanceSessions(user.uid, currentMonth, updated);
    showToast('打刻を保存しました');
  }, [user, currentMonth, showToast]);

  const updateSession = useCallback(async (id: string, hours: number) => {
    if (!user) return;
    const updated = sessionsRef.current.map(s =>
      s.id === id ? { ...s, hours: Math.round(hours * 100) / 100 } : s
    );
    setSessions(updated);
    await saveAttendanceSessions(user.uid, currentMonth, updated);
    showToast('保存しました');
  }, [user, currentMonth, showToast]);

  const deleteSession = useCallback(async (id: string) => {
    if (!user) return;
    const updated = sessionsRef.current.filter(s => s.id !== id);
    setSessions(updated);
    await saveAttendanceSessions(user.uid, currentMonth, updated);
    showToast('削除しました');
  }, [user, currentMonth, showToast]);

  const getDailyTotals = useCallback((year: number, month: number): Record<string, number> => {
    const prefix = format(new Date(year, month - 1, 1), 'yyyy-MM');
    const totals: Record<string, number> = {};
    for (const s of sessions) {
      if (s.date.startsWith(prefix)) {
        totals[s.date] = (totals[s.date] ?? 0) + s.hours;
      }
    }
    return totals;
  }, [sessions]);

  // Export current month attendance as CSV download
  const exportMonthCSV = useCallback(() => {
    const sorted = [...sessionsRef.current].sort((a, b) => a.date.localeCompare(b.date));
    const header = '日付,時間(h),メモ';
    const rows = sorted.map(s =>
      `${s.date},${s.hours},"${(s.note ?? '').replace(/"/g, '""')}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${currentMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentMonth]);

  return {
    sessions,
    loading,
    addSession,
    updateSession,
    deleteSession,
    getDailyTotals,
    exportMonthCSV,
  };
}
