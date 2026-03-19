import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, MonthSettings } from '../types/WorkData';
import {
  subscribeToSettings,
  saveSettings,
  subscribeToMonthSettings,
  saveMonthSettings,
  clearMonthSettings,
} from '../lib/firestoreService';
import { useAuth } from './useAuth';
import { useToast } from '../contexts/ToastContext';

const DEFAULT: AppSettings = { targetMin: 140, targetMax: 180 };

export function useMonthSettings(month: string) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [defaults, setDefaults] = useState<AppSettings>(DEFAULT);
  const [monthOverride, setMonthOverride] = useState<MonthSettings | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToSettings(user.uid, setDefaults);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToMonthSettings(user.uid, month, setMonthOverride);
  }, [user, month]);

  // 月別設定があればそれを優先、なければデフォルト
  const settings: AppSettings = {
    targetMin: monthOverride?.targetMin ?? defaults.targetMin,
    targetMax: monthOverride?.targetMax ?? defaults.targetMax,
  };

  const updateDefaults = useCallback(async (next: AppSettings) => {
    if (!user) return;
    setDefaults(next);
    await saveSettings(user.uid, next);
    showToast('デフォルト設定を保存しました');
  }, [user, showToast]);

  const updateMonthSettings = useCallback(async (next: MonthSettings | null) => {
    if (!user) return;
    setMonthOverride(next);
    if (next === null) {
      await clearMonthSettings(user.uid, month);
      showToast(`${month} の設定をリセットしました`);
    } else {
      await saveMonthSettings(user.uid, month, next);
      showToast(`${month} の目標を保存しました`);
    }
  }, [user, month, showToast]);

  return { settings, defaults, monthOverride, updateDefaults, updateMonthSettings };
}
