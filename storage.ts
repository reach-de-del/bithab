import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { dateKey } from './dates';
import type { AppData, Settings } from './types';

const DATA_KEY = 'habitquest:data:v1';
const SETTINGS_KEY = 'habitquest:settings:v1';
const API_KEY = 'habitquest_anthropic_key';

export const DEFAULT_MODEL = 'claude-haiku-5-5';

/** Starter habits so the app isn't empty on first launch. */
export function starterData(): AppData {
  const today = dateKey();
  const mk = (id: string, name: string, emoji: string, xp: number) => ({
    id,
    name,
    emoji,
    xp,
    createdAt: today,
  });
  return {
    version: 1,
    habits: [
      mk('h1', 'Go to the gym', '🏋️', 20),
      mk('h2', 'Drink 2 litres of water', '💧', 10),
      mk('h3', 'Sleep 8 hours', '😴', 15),
      mk('h4', 'Study for 2 hours', '📚', 20),
      mk('h5', 'Read & meditate', '🧘', 10),
    ],
    logs: {},
    bonus: {},
  };
}

export function isAppData(x: unknown): x is AppData {
  const d = x as AppData;
  return !!d && d.version === 1 && Array.isArray(d.habits) && typeof d.logs === 'object' && typeof d.bonus === 'object';
}

/** Every change is written to disk, and logs are keyed by date, so history persists day after day. */
export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isAppData(parsed)) return parsed;
    }
  } catch {
    // fall through to starter data
  }
  return starterData();
}

export async function saveData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) return { model: DEFAULT_MODEL, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return { model: DEFAULT_MODEL };
}

export async function saveSettings(s: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// On phones the API key lives in the OS keychain/keystore. Browsers have no keystore, so on web it
// falls back to this site's localStorage (never in the repo, never sent anywhere except Anthropic).
export async function loadApiKey(): Promise<string> {
  try {
    if (Platform.OS === 'web') return (await AsyncStorage.getItem(API_KEY)) ?? '';
    return (await SecureStore.getItemAsync(API_KEY)) ?? '';
  } catch {
    return '';
  }
}

export async function saveApiKey(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (key) await AsyncStorage.setItem(API_KEY, key);
    else await AsyncStorage.removeItem(API_KEY);
    return;
  }
  if (key) await SecureStore.setItemAsync(API_KEY, key);
  else await SecureStore.deleteItemAsync(API_KEY);
}
