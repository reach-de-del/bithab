import { addDays } from './dates';
import type { AppData } from './types';

export const PERFECT_DAY_BONUS = 20;
export const XP_CHOICES = [5, 10, 15, 20, 30];

/** Cumulative XP needed to *reach* a level: L2=100, L3=300, L4=600, L5=1000 ... */
export const xpToReach = (level: number) => 50 * level * (level - 1);

export function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + (4 * xp) / 50)) / 2));
}

const TITLES = [
  'Rookie',
  'Starter',
  'Regular',
  'Committed',
  'Disciplined',
  'Unstoppable',
  'Habit Hero',
  'Routine Master',
  'Legend',
  'Mythic',
];

export const titleForLevel = (level: number) => TITLES[Math.min(level - 1, TITLES.length - 1)];

export function totalXp(data: AppData): number {
  let sum = 0;
  for (const day of Object.values(data.logs)) for (const v of Object.values(day)) sum += v;
  for (const v of Object.values(data.bonus)) sum += v;
  return sum;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const base = xpToReach(level);
  const next = xpToReach(level + 1);
  return { level, into: xp - base, needed: next - base, ratio: (xp - base) / (next - base) };
}

const hasAny = (data: AppData, day: string) => Object.keys(data.logs[day] ?? {}).length > 0;

/** Consecutive days (ending today, or yesterday if today is still empty) with >= 1 completion. */
export function currentStreak(data: AppData, today: string): number {
  let day = hasAny(data, today) ? today : addDays(today, -1);
  let n = 0;
  while (hasAny(data, day)) {
    n += 1;
    day = addDays(day, -1);
  }
  return n;
}

export function bestStreak(data: AppData): number {
  const days = Object.keys(data.logs)
    .filter((d) => hasAny(data, d))
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of days) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function activeHabits(data: AppData) {
  return data.habits.filter((h) => !h.archived);
}

/** Share (0..1) of active habits completed on `day`. */
export function dayRatio(data: AppData, day: string): number {
  const habits = activeHabits(data);
  if (habits.length === 0) return 0;
  const done = habits.filter((h) => data.logs[day]?.[h.id] !== undefined).length;
  return done / habits.length;
}

/** XP earned on a given day, including any perfect-day bonus. */
export function xpOnDay(data: AppData, day: string): number {
  const logged = Object.values(data.logs[day] ?? {}).reduce((a, b) => a + b, 0);
  return logged + (data.bonus[day] ?? 0);
}
