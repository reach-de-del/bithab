export type Habit = {
  id: string;
  name: string;
  emoji: string;
  /** XP awarded each time this habit is completed. */
  xp: number;
  /** Local date (YYYY-MM-DD) the habit was created. */
  createdAt: string;
  /** Archived habits disappear from Today but keep their history and XP. */
  archived?: boolean;
};

export type AppData = {
  version: 1;
  habits: Habit[];
  /** logs[date][habitId] = XP awarded for that completion (frozen at completion time). */
  logs: Record<string, Record<string, number>>;
  /** bonus[date] = perfect-day bonus XP awarded on that date. */
  bonus: Record<string, number>;
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export type Settings = {
  model: string;
};
