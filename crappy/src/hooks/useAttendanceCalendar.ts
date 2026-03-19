import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { format, startOfWeek, addDays, addWeeks, startOfDay } from 'date-fns';
import type { WorkSession } from '../types/WorkData';
import { subscribeToAttendance, saveAttendanceSessions } from '../lib/firestoreService';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

export function useAttendanceCalendar() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);

  // Stable "today" — recomputed only on mount
  const [today] = useState(() => startOfDay(new Date()));

  const weekStart = useMemo(
    () => addWeeks(startOfWeek(today, { weekStartsOn: 1 }), weekOffset),
    [today, weekOffset],
  );

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  // Which month(s) does this week span? (usually 1, occasionally 2)
  const weekMonthsKey = useMemo(
    () => [...new Set(weekDays.map(d => format(d, 'yyyy-MM')))].join(','),
    [weekDays],
  );

  // sessions keyed by "YYYY-MM"
  const [sessionsByMonth, setSessionsByMonth] = useState<Record<string, WorkSession[]>>({});
  const sessionsByMonthRef = useRef<Record<string, WorkSession[]>>({});

  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const months = weekMonthsKey.split(',');
    setLoadingSet(new Set(months));

    const unsubs = months.map(month =>
      subscribeToAttendance(user.uid, month, sessions => {
        setSessionsByMonth(prev => {
          const next = { ...prev, [month]: sessions };
          sessionsByMonthRef.current = next;
          return next;
        });
        setLoadingSet(prev => {
          const next = new Set(prev);
          next.delete(month);
          return next;
        });
      }),
    );

    return () => unsubs.forEach(u => u());
  }, [user, weekMonthsKey]);

  const loading = loadingSet.size > 0;

  // { "YYYY-MM-DD": WorkSession[] } for the current week
  const dailyData = useMemo(() => {
    const map: Record<string, WorkSession[]> = {};
    for (const sessions of Object.values(sessionsByMonth)) {
      for (const s of sessions) {
        if (!map[s.date]) map[s.date] = [];
        map[s.date].push(s);
      }
    }
    return map;
  }, [sessionsByMonth]);

  const weekTotal = useMemo(
    () =>
      weekDays.reduce((sum, day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        return sum + (dailyData[dateStr] ?? []).reduce((s, sess) => s + sess.hours, 0);
      }, 0),
    [weekDays, dailyData],
  );

  // ── Mutations ────────────────────────────────────────────────────────────

  const addSession = useCallback(
    async (date: string, hours: number, note?: string) => {
      if (!user || hours <= 0) return;
      const month = date.slice(0, 7);
      const newSession: WorkSession = {
        id: crypto.randomUUID(),
        date,
        hours: Math.round(hours * 100) / 100,
        note,
      };
      const current = sessionsByMonthRef.current[month] ?? [];
      const updated = [...current, newSession];
      setSessionsByMonth(prev => {
        const next = { ...prev, [month]: updated };
        sessionsByMonthRef.current = next;
        return next;
      });
      await saveAttendanceSessions(user.uid, month, updated);
      showToast('保存しました');
    },
    [user, showToast],
  );

  const updateSession = useCallback(
    async (id: string, hours: number) => {
      if (!user) return;
      for (const [month, sessions] of Object.entries(sessionsByMonthRef.current)) {
        if (!sessions.some(s => s.id === id)) continue;
        const updated = sessions.map(s =>
          s.id === id ? { ...s, hours: Math.round(hours * 100) / 100 } : s,
        );
        setSessionsByMonth(prev => {
          const next = { ...prev, [month]: updated };
          sessionsByMonthRef.current = next;
          return next;
        });
        await saveAttendanceSessions(user.uid, month, updated);
        showToast('保存しました');
        break;
      }
    },
    [user, showToast],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      if (!user) return;
      for (const [month, sessions] of Object.entries(sessionsByMonthRef.current)) {
        if (!sessions.some(s => s.id === id)) continue;
        const updated = sessions.filter(s => s.id !== id);
        setSessionsByMonth(prev => {
          const next = { ...prev, [month]: updated };
          sessionsByMonthRef.current = next;
          return next;
        });
        await saveAttendanceSessions(user.uid, month, updated);
        showToast('削除しました');
        break;
      }
    },
    [user, showToast],
  );

  // Export the first month of the current week as CSV
  const exportMonthCSV = useCallback(() => {
    const month = format(weekDays[0], 'yyyy-MM');
    const sessions = [...(sessionsByMonthRef.current[month] ?? [])]
      .sort((a, b) => a.date.localeCompare(b.date));
    const header = '日付,時間(h),メモ';
    const rows = sessions.map(s =>
      `${s.date},${s.hours},"${(s.note ?? '').replace(/"/g, '""')}"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [weekDays]);

  return {
    today,
    weekDays,
    weekOffset,
    setWeekOffset,
    dailyData,
    weekTotal,
    loading,
    addSession,
    updateSession,
    deleteSession,
    exportMonthCSV,
  };
}
