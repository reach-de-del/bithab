import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LevelCard } from '../components/LevelCard';
import { lastDays, parseKey, weekdayLetter } from '../dates';
import { colors, shared } from '../theme';
import type { useHabitStore } from '../useHabitStore';
import { activeHabits, bestStreak, currentStreak, totalXp } from '../xp';

type Store = ReturnType<typeof useHabitStore>;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={[shared.card, styles.stat]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={shared.muted}>{label}</Text>
    </View>
  );
}

export function ProgressScreen({ store }: { store: Store }) {
  const { data, today } = store;
  if (!data) return null;

  const habits = activeHabits(data);
  const week = lastDays(today, 7);
  const month = lastDays(today, 28);
  const xp = totalXp(data);
  const daysTracked = Object.keys(data.logs).filter((d) => Object.keys(data.logs[d]).length > 0).length;
  const totalDone = Object.values(data.logs).reduce((n, day) => n + Object.keys(day).length, 0);

  // Heat-map cell colour from share of habits completed that day.
  const ratio = (day: string) => {
    const done = Object.keys(data.logs[day] ?? {}).length;
    const existing = habits.filter((h) => h.createdAt <= day).length || 1;
    return Math.min(1, done / existing);
  };
  const heat = (r: number) => (r === 0 ? colors.border : r < 0.5 ? '#14532D' : r < 1 ? '#16A34A' : '#4ADE80');

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={shared.h1}>Progress</Text>
      <LevelCard xp={xp} streak={currentStreak(data, today)} />

      <View style={styles.statRow}>
        <Stat label="Total XP" value={xp} />
        <Stat label="Best streak" value={`${bestStreak(data)}d`} />
      </View>
      <View style={styles.statRow}>
        <Stat label="Habits done" value={totalDone} />
        <Stat label="Perfect days" value={Object.keys(data.bonus).length} />
      </View>
      <Text style={shared.muted}>{daysTracked} day(s) of history saved on this device.</Text>

      <View style={[shared.card, { gap: 10 }]}>
        <Text style={shared.h2}>Last 4 weeks</Text>
        <View style={styles.heatGrid}>
          {month.map((d) => (
            <View key={d} style={[styles.heatCell, { backgroundColor: heat(ratio(d)) }, d === today && styles.today]} />
          ))}
        </View>
        <Text style={shared.muted}>Darker = more of your habits completed.</Text>
      </View>

      <View style={[shared.card, { gap: 14 }]}>
        <Text style={shared.h2}>This week by habit</Text>
        <View style={styles.weekHeader}>
          <View style={{ flex: 1 }} />
          {week.map((d) => (
            <Text key={d} style={styles.dayLetter}>
              {weekdayLetter(d)}
            </Text>
          ))}
        </View>
        {habits.map((h) => {
          const eligible = lastDays(today, 30).filter((d) => d >= h.createdAt);
          const done = eligible.filter((d) => data.logs[d]?.[h.id] !== undefined).length;
          const pct = eligible.length ? Math.round((done / eligible.length) * 100) : 0;
          return (
            <View key={h.id}>
              <View style={styles.weekRow}>
                <Text style={styles.habitLabel} numberOfLines={1}>
                  {h.emoji} {h.name}
                </Text>
                {week.map((d) => {
                  const on = data.logs[d]?.[h.id] !== undefined;
                  const missed = !on && d >= h.createdAt && parseKey(d) < parseKey(today);
                  return (
                    <View
                      key={d}
                      style={[styles.dot, on && styles.dotOn, missed && styles.dotMissed]}
                    />
                  );
                })}
              </View>
              <Text style={[shared.muted, { fontSize: 11 }]}>{pct}% over last 30 days</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  statRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontSize: 24, fontWeight: '900', color: colors.accentText },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  heatCell: { width: '12.2%', aspectRatio: 1, borderRadius: 6 },
  today: { borderWidth: 2, borderColor: colors.gold },
  weekHeader: { flexDirection: 'row', alignItems: 'center' },
  dayLetter: { width: 26, textAlign: 'center', color: colors.muted, fontSize: 12, fontWeight: '700' },
  weekRow: { flexDirection: 'row', alignItems: 'center' },
  habitLabel: { flex: 1, color: colors.text, fontWeight: '600' },
  dot: { width: 18, height: 18, borderRadius: 9, marginHorizontal: 4, backgroundColor: colors.border },
  dotOn: { backgroundColor: colors.primary },
  dotMissed: { backgroundColor: '#5B2226' },
});
