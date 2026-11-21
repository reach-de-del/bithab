import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { dateKey } from './dates';
import { isAppData, loadData, saveData } from './storage';
import type { AppData, Habit } from './types';
import { PERFECT_DAY_BONUS, activeHabits, levelFromXp, totalXp } from './xp';

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export type ToggleResult = { delta: number; levelUp: number | null; perfect: boolean };

export function useHabitStore() {
  const [data, setData] = useState<AppData | null>(null);
  const [today, setToday] = useState(dateKey());
  const dataRef = useRef<AppData | null>(null);
  dataRef.current = data;

  // Load once.
  useEffect(() => {
    loadData().then(setData);
  }, []);

  // Persist on every change (after the initial load).
  useEffect(() => {
    if (data) saveData(data).catch(() => {});
  }, [data]);

  // Roll over to the new day when the app comes back to the foreground or the clock passes midnight.
  useEffect(() => {
    const refresh = () => setToday(dateKey());
    const sub = AppState.addEventListener('change', (s) => s === 'active' && refresh());
    const timer = setInterval(refresh, 30_000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  const addHabit = useCallback((h: Pick<Habit, 'name' | 'emoji' | 'xp'>) => {
    setData((d) => d && { ...d, habits: [...d.habits, { ...h, id: newId(), createdAt: dateKey() }] });
  }, []);

  const updateHabit = useCallback((id: string, patch: Partial<Pick<Habit, 'name' | 'emoji' | 'xp'>>) => {
    setData((d) => d && { ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) });
  }, []);

  /** Archive = "delete" from Today while keeping past XP and history intact. */
  const archiveHabit = useCallback((id: string) => {
    setData((d) => d && { ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, archived: true } : h)) });
  }, []);

  const toggle = useCallback(
    (habitId: string, date: string = today): ToggleResult | null => {
      const d = dataRef.current;
      const habit = d?.habits.find((h) => h.id === habitId);
      if (!d || !habit || date > today) return null; // no checking off the future

      const day = { ...(d.logs[date] ?? {}) };
      let delta = 0;
      if (day[habitId] !== undefined) {
        delta -= day[habitId];
        delete day[habitId];
      } else {
        day[habitId] = habit.xp;
        delta += habit.xp;
      }

      const all = activeHabits(d).every((h) => day[h.id] !== undefined);
      const bonus = { ...d.bonus };
      let perfect = false;
      if (all && bonus[date] === undefined) {
        bonus[date] = PERFECT_DAY_BONUS;
        delta += PERFECT_DAY_BONUS;
        perfect = true;
      } else if (!all && bonus[date] !== undefined) {
        delta -= bonus[date];
        delete bonus[date];
      }

      const before = totalXp(d);
      const lvBefore = levelFromXp(before);
      const lvAfter = levelFromXp(before + delta);
      setData({ ...d, logs: { ...d.logs, [date]: day }, bonus });
      return { delta, levelUp: lvAfter > lvBefore ? lvAfter : null, perfect };
    },
    [today],
  );

  const replaceAll = useCallback((next: unknown): boolean => {
    if (!isAppData(next)) return false;
    setData(next);
    return true;
  }, []);

  return { data, today, addHabit, updateHabit, archiveHabit, toggle, replaceAll, setData };
}
