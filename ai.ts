import { Platform } from 'react-native';
import { prettyDate } from './dates';
import { activeHabits, currentStreak, levelProgress, titleForLevel, totalXp } from './xp';
import type { AppData, ChatMessage } from './types';

const ENDPOINT = 'https://api.anthropic.com/v1/messages';

/** Gives the coach a compact snapshot of the user's habits so advice is specific. */
export function buildSystemPrompt(data: AppData, today: string): string {
  const done = data.logs[today] ?? {};
  const habits = activeHabits(data);
  const lines = habits.map((h) => `- ${h.emoji} ${h.name} (+${h.xp} XP): ${done[h.id] !== undefined ? 'DONE' : 'not done yet'}`);
  const xp = totalXp(data);
  const { level } = levelProgress(xp);
  return [
    'You are Quest, a warm, upbeat and practical habit coach inside a gamified habit-tracker app.',
    'Keep replies short (under ~120 words), concrete and encouraging. Prefer tiny, doable next steps over big plans.',
    'Use plain text with simple "-" bullets; no markdown headings.',
    `Today is ${prettyDate(today)}.`,
    `User: level ${level} (${titleForLevel(level)}), ${xp} XP, current streak ${currentStreak(data, today)} days.`,
    habits.length ? `Today's habits:\n${lines.join('\n')}` : "The user has no habits yet.",
  ].join('\n');
}

export async function askCoach(opts: {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
}): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': '2023-06-01',
      // Required by Anthropic for calls made straight from a browser.
      ...(Platform.OS === 'web' ? { 'anthropic-dangerous-direct-browser-access': 'true' } : {}),
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: 500,
      system: opts.system,
      messages: opts.messages,
    }),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  const text = (body?.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n')
    .trim();
  return text || '(no reply)';
}
