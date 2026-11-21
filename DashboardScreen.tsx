import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LevelCard } from '../components/LevelCard';
import { Ring } from '../components/Ring';
import { colors, shared } from '../theme';
import type { AppData } from '../types';
import { PERFECT_DAY_BONUS, activeHabits, bestStreak, currentStreak, dayRatio, levelProgress, totalXp, xpOnDay } from '../xp';

type Props = {
  data: AppData;
  date: string;
  today: string;
  onToggle: (id: string) => void;
  onAskCoach: (prompt: string) => void;
};

/** One of the four mini stat columns under the week strip (label, value / target, thin bar). */
function MiniStat({ label, value, target, ratio, color }: { label: string; value: string; target: string; ratio: number; color: string }) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <Text style={styles.miniText} numberOfLines={1}>
        <Text style={{ fontWeight: '800', color }}>{label} </Text>
        {value} / {target}
      </Text>
      <View style={styles.miniTrack}>
        <View style={[styles.miniFill, { backgroundColor: color, width: `${Math.max(0, Math.min(1, ratio)) * 100}%` }]} />
      </View>
    </View>
  );
}

export function DashboardScreen({ data, date, today, onToggle, onAskCoach }: Props) {
  const habits = activeHabits(data);
  const log = data.logs[date] ?? {};
  const doneCount = habits.filter((h) => log[h.id] !== undefined).length;
  const ratio = dayRatio(data, date);
  const future = date > today;

  const possibleXp = habits.reduce((n, h) => n + h.xp, 0) + PERFECT_DAY_BONUS;
  const earnedXp = xpOnDay(data, date);
  const streak = currentStreak(data, today);
  const lp = levelProgress(totalXp(data));

  const remaining = habits.filter((h) => log[h.id] === undefined);
  const completed = habits.filter((h) => log[h.id] !== undefined);

  const message =
    future ? 'Come back on this day to log it.' :
    habits.length === 0 ? 'Add your first habit to get started.' :
    ratio >= 1 ? 'Perfect day! Every habit done 🎉' :
    ratio >= 0.5 ? 'Over halfway — keep the momentum.' :
    doneCount > 0 ? 'Nice start. One more!' :
    date === today ? 'A fresh day. Pick the easiest habit first.' : 'Nothing logged for this day.';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* Daily numbers, mirrors the calories/macros row of a food log */}
      <View style={styles.miniRow}>
        <MiniStat label="✓" value={String(doneCount)} target={String(habits.length)} ratio={ratio} color={colors.primary} />
        <MiniStat label="XP" value={String(earnedXp)} target={String(possibleXp)} ratio={possibleXp ? earnedXp / possibleXp : 0} color={colors.gold} />
        <MiniStat label="🔥" value={String(streak)} target={String(Math.max(7, bestStreak(data)))} ratio={streak / Math.max(7, bestStreak(data))} color="#FB923C" />
        <MiniStat label="Lv" value={String(lp.into)} target={String(lp.needed)} ratio={lp.ratio} color="#60A5FA" />
      </View>

      {/* Big daily ring */}
      <View style={[shared.card, styles.ringCard]}>
        <Ring size={190} stroke={16} ratio={ratio} color={ratio >= 1 ? colors.accentText : colors.primary}>
          <Text style={styles.ringBig}>
            {doneCount}
            <Text style={styles.ringSmall}> / {habits.length}</Text>
          </Text>
          <Text style={shared.muted}>habits done</Text>
          <Text style={styles.ringPct}>{Math.round(ratio * 100)}%</Text>
        </Ring>
        <Text style={[shared.h2, { textAlign: 'center' }]}>{message}</Text>
        {ratio >= 1 && <Text style={styles.bonus}>+{PERFECT_DAY_BONUS} XP perfect-day bonus earned</Text>}
      </View>

      <LevelCard xp={totalXp(data)} streak={streak} />

      {remaining.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={shared.h2}>To do</Text>
          {remaining.map((h) => (
            <Pressable key={h.id} disabled={future} onPress={() => onToggle(h.id)} style={[shared.card, styles.row, future && { opacity: 0.5 }]}>
              <View style={styles.circle} />
              <Text style={styles.rowText}>
                {h.emoji} {h.name}
              </Text>
              <Text style={styles.xp}>+{h.xp} XP</Text>
            </Pressable>
          ))}
        </View>
      )}

      {completed.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={shared.h2}>Done</Text>
          {completed.map((h) => (
            <Pressable key={h.id} onPress={() => onToggle(h.id)} style={[shared.card, styles.row, { backgroundColor: colors.primarySoft, borderColor: colors.primary }]}>
              <View style={[styles.circle, styles.circleOn]}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>✓</Text>
              </View>
              <Text style={[styles.rowText, { color: colors.muted, textDecorationLine: 'line-through' }]}>
                {h.emoji} {h.name}
              </Text>
              <Text style={styles.xp}>+{log[h.id]} XP</Text>
            </Pressable>
          ))}
        </View>
      )}

      {!future && (
        <Pressable
          style={[shared.card, styles.coach]}
          onPress={() =>
            onAskCoach(
              ratio >= 1
                ? 'I finished all my habits today. Give me a short recap and one idea to level up tomorrow.'
                : 'Look at my habits for today and give me a simple plan to finish the rest.',
            )
          }
        >
          <Text style={{ fontSize: 22 }}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={shared.h2}>Ask your coach</Text>
            <Text style={shared.muted}>{ratio >= 1 ? 'Get a recap and a tip for tomorrow' : 'Get a plan for the rest of the day'}</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 20 }}>›</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  miniRow: { flexDirection: 'row', gap: 12 },
  miniText: { color: colors.text, fontSize: 12 },
  miniTrack: { height: 4, borderRadius: 2, backgroundColor: colors.surface, overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: 2 },
  ringCard: { alignItems: 'center', gap: 14, paddingVertical: 22 },
  ringBig: { color: colors.text, fontSize: 44, fontWeight: '900' },
  ringSmall: { color: colors.muted, fontSize: 22, fontWeight: '700' },
  ringPct: { color: colors.accentText, fontWeight: '800', marginTop: 2 },
  bonus: { color: colors.goldText, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  xp: { color: colors.goldText, fontWeight: '700', fontSize: 12 },
  circle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#48484A', alignItems: 'center', justifyContent: 'center' },
  circleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  coach: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
