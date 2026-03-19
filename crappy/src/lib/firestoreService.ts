import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { WorkSession, AppSettings, MonthSettings, Expense } from '../types/WorkData';

const DEFAULT_SETTINGS: AppSettings = { targetMin: 140, targetMax: 180 };

/**
 * Firestore は undefined を拒否するため、保存前に除去する。
 * JSON往復で undefined フィールドを安全に落とす。
 */
function sanitize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// ─── Settings ───────────────────────────────────────────────

export function subscribeToSettings(
  uid: string,
  callback: (settings: AppSettings) => void,
): Unsubscribe {
  const ref = doc(db, 'users', uid, 'settings', 'current');
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({ targetMin: data.targetMin, targetMax: data.targetMax });
    } else {
      callback(DEFAULT_SETTINGS);
    }
  });
}

export async function saveSettings(uid: string, settings: AppSettings): Promise<void> {
  const ref = doc(db, 'users', uid, 'settings', 'current');
  await setDoc(ref, { ...sanitize(settings), updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Month Settings (per-month override) ─────────────────────

export function subscribeToMonthSettings(
  uid: string,
  month: string,
  callback: (settings: MonthSettings | null) => void,
): Unsubscribe {
  const ref = doc(db, 'users', uid, 'monthSettings', month);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback({ targetMin: data.targetMin, targetMax: data.targetMax });
    } else {
      callback(null);
    }
  });
}

export async function saveMonthSettings(
  uid: string,
  month: string,
  settings: MonthSettings,
): Promise<void> {
  const ref = doc(db, 'users', uid, 'monthSettings', month);
  await setDoc(ref, { ...sanitize(settings), updatedAt: serverTimestamp() }, { merge: true });
}

export async function clearMonthSettings(uid: string, month: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'monthSettings', month);
  await deleteDoc(ref);
}

// ─── Attendance ──────────────────────────────────────────────

export function subscribeToAttendance(
  uid: string,
  month: string, // "YYYY-MM"
  callback: (sessions: WorkSession[]) => void,
): Unsubscribe {
  const ref = doc(db, 'users', uid, 'attendance', month);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback((snap.data().sessions as WorkSession[]) ?? []);
    } else {
      callback([]);
    }
  });
}

export async function saveAttendanceSessions(
  uid: string,
  month: string,
  sessions: WorkSession[],
): Promise<void> {
  const ref = doc(db, 'users', uid, 'attendance', month);
  await setDoc(ref, {
    month,
    sessions: sanitize(sessions),
    updatedAt: serverTimestamp(),
  });
}

// ─── Expenses ────────────────────────────────────────────────

export function subscribeToExpenses(
  uid: string,
  month: string,
  callback: (items: Expense[]) => void,
): Unsubscribe {
  const ref = doc(db, 'users', uid, 'expenses', month);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback((snap.data().items as Expense[]) ?? []);
    } else {
      callback([]);
    }
  });
}

export async function saveExpenseItems(
  uid: string,
  month: string,
  items: Expense[],
): Promise<void> {
  const ref = doc(db, 'users', uid, 'expenses', month);
  await setDoc(ref, {
    month,
    items: sanitize(items),
    updatedAt: serverTimestamp(),
  });
}
