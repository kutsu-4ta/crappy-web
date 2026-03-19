import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

// Comma-separated allowed emails from env. If empty, allow any Google account.
const ALLOWED_EMAILS = (import.meta.env.VITE_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e: string) => e.trim())
  .filter(Boolean);

export type AuthState = 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized';

export interface AuthResult {
  user: User | null;
  authState: AuthState;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export function useAuth(): AuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    // リダイレクト認証後の結果を処理（モバイル向け）
    getRedirectResult(auth).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setAuthState('unauthenticated');
      } else if (ALLOWED_EMAILS.length === 0 || ALLOWED_EMAILS.includes(u.email ?? '')) {
        setAuthState('authorized');
      } else {
        setAuthState('unauthorized');
      }
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    try {
      // Try popup first (desktop friendly)
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // Popup blocked or unavailable → fall back to redirect (mobile friendly)
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        throw err;
      }
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  return { user, authState, signIn, signOutUser };
}
