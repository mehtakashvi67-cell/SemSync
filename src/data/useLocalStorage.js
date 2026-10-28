// src/data/useLocalStorage.js
// -------------------------------------------------------
// Custom hook: read from / write to localStorage with a
// React state wrapper.  Falls back to `initialValue` when
// the key does not yet exist.
// -------------------------------------------------------
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  // Lazy initialiser – runs once
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // quota exceeded – silently fail
    }
  }, [key, value]);

  return [value, setValue];
}
