import { StyleSheet, Text, View } from 'react-native';
import { colors, shared } from '../theme';
import { levelProgress, titleForLevel } from '../xp';

export function LevelCard({ xp, streak }: { xp: number; streak: number }) {
  const p = levelProgress(xp);
  return (
    <View style={[shared.card, styles.card]}>
      <View style={styles.row}>
        <View style={styles.badge}>
          <Text style={styles.badgeNum}>{p.level}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={shared.h2}>{titleForLevel(p.level)}</Text>
          <Text style={shared.muted}>
            {p.into} / {p.needed} XP to level {p.level + 1}
          </Text>
        </View>
        <View style={styles.streak}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(3, Math.min(100, p.ratio * 100))}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.gold,
  },
  badgeNum: { color: '#fff', fontWeight: '900', fontSize: 22 },
  streak: { backgroundColor: colors.goldSoft, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  streakText: { fontWeight: '800', color: colors.goldText },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.primarySoft, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 5 },
});
