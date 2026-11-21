import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, shared } from '../theme';
import type { AppData, Habit } from '../types';
import { activeHabits } from '../xp';

type Props = {
  data: AppData;
  date: string;
  today: string;
  onToggle: (id: string) => void;
  onEdit: (h: Habit) => void;
  onAdd: () => void;
  onAskCoach: (prompt: string) => void;
};

/** The "Habits" tab: the checklist for the selected day. */
export function TodayScreen({ data, date, today, onToggle, onEdit, onAdd, onAskCoach }: Props) {
  const habits = activeHabits(data);
  const done = data.logs[date] ?? {};
  const future = date > today;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {future && <Text style={[shared.muted, { textAlign: 'center' }]}>You can’t check off future days yet.</Text>}
      {date < today && <Text style={[shared.muted, { textAlign: 'center' }]}>Editing a past day — changes update your XP.</Text>}

      {habits.length === 0 && (
        <Text style={[shared.muted, { textAlign: 'center', marginTop: 20 }]}>
          No habits yet. Tap “Add habit” to start your quest.
        </Text>
      )}

      {habits.map((h) => {
        const isDone = done[h.id] !== undefined;
        return (
          <View key={h.id} style={[shared.card, styles.habit, isDone && styles.habitDone, future && { opacity: 0.5 }]}>
            <Pressable disabled={future} onPress={() => onToggle(h.id)} hitSlop={8} style={[styles.check, isDone && styles.checkOn]}>
              {isDone && <Text style={styles.checkMark}>✓</Text>}
            </Pressable>
            <Pressable disabled={future} style={{ flex: 1 }} onPress={() => onToggle(h.id)}>
              <Text style={[styles.habitName, isDone && styles.strike]}>
                {h.emoji} {h.name}
              </Text>
              <Text style={styles.xp}>+{h.xp} XP</Text>
            </Pressable>
            <Pressable
              hitSlop={8}
              style={styles.iconBtn}
              onPress={() =>
                onAskCoach(`Help me complete "${h.name}" right now. Give me 3 tiny steps I can start in the next 2 minutes.`)
              }
            >
              <Text style={{ fontSize: 18 }}>✨</Text>
            </Pressable>
            <Pressable hitSlop={8} style={styles.iconBtn} onPress={() => onEdit(h)}>
              <Text style={{ fontSize: 18 }}>✏️</Text>
            </Pressable>
          </View>
        );
      })}

      <Pressable style={[shared.button, { marginTop: 4 }]} onPress={onAdd}>
        <Text style={shared.buttonText}>＋ Add habit</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  habit: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  habitDone: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#48484A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: '#fff', fontWeight: '900', fontSize: 16 },
  habitName: { fontSize: 16, fontWeight: '600', color: colors.text },
  strike: { textDecorationLine: 'line-through', color: colors.muted },
  xp: { color: colors.goldText, fontWeight: '700', fontSize: 12, marginTop: 2 },
  iconBtn: { padding: 4 },
});
