import { StyleSheet } from 'react-native';

export const colors = {
  bg: '#121212',
  card: '#1C1C1E',
  surface: '#2A2A2C',
  primary: '#10B981',
  primaryDark: '#065F46',
  primarySoft: '#12372B',
  accentText: '#6EE7B7',
  gold: '#F5B301',
  goldSoft: '#3A2F0B',
  goldText: '#FCD34D',
  text: '#F4F4F5',
  muted: '#9A9AA0',
  border: '#2C2C2E',
  danger: '#F87171',
};

export const shared = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
});
