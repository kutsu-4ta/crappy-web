import { useState, useCallback } from 'react';
import type { AppSettings } from '../types/WorkData';
import { storage } from '../lib/storage';

export function useMonthSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      storage.saveSettings(next);
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
