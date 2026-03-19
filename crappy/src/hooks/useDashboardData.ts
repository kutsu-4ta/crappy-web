import { useState, useEffect, useMemo } from 'react';
import type { WorkSession } from '../types/WorkData';
import { subscribeToAttendance } from '../lib/firestoreService';
import { useAuth } from './useAuth';

export function useDashboardData(month: string) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToAttendance(user.uid, month, (fetched) => {
      setSessions(fetched);
      setLoading(false);
    });
    return unsub;
  }, [user, month]);

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const s of sessions) {
      totals[s.date] = (totals[s.date] ?? 0) + s.hours;
    }
    return totals;
  }, [sessions]);

  return { loading, dailyTotals };
}
