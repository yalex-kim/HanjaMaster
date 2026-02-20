import { useCallback } from 'react';

export const KEYS = {
  USER_PROGRESS: 'hanja_user_progress',
  CHAR_MASTERY: 'hanja_char_mastery',
  SETTINGS: 'hanja_settings',
};

const APP_KEY_PREFIX = 'hanja_';

export function useStorage() {
  const get = useCallback((key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const set = useCallback((key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  }, []);

  const remove = useCallback((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
  }, []);

  const clear = useCallback(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(APP_KEY_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch {
      // Storage unavailable
    }
  }, []);

  return { get, set, remove, clear, KEYS };
}
