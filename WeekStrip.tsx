import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { addDays, parseKey } from '../dates';
import { colors } from '../theme';
import type { AppData } from '../types';
import { dayRatio } from '../xp';
import { PillRing } from './Ring';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const GAP = 6;
const PILL_H = 74;

/** Monday of the week containing `key`. */
export function weekStartOf(key: string): string {
  const dow = (parseKey(key).getDay() + 6) % 7; // Mon=0
  return addDays(key, -dow);
}

type Props = {
  data: AppData;
  selected: string;
  today: string;
  onSelect: (day: string) => void;
};

/** Seven pill-shaped day buttons; each outline fills up like a ring as that day's habits are completed. */
export function WeekStrip({ data, selected, today, onSelect }: Props) {
  const { width } = useWindowDimensions();
  const pillW = Math.floor((width - 32 - GAP * 6) / 7);
  const [weekStart, setWeekStart] = useState(weekStartOf(selected));

  // Follow the selection if it jumps to another week (e.g. the "today" button).
  useEffect(() => {
    setWeekStart(weekStartOf(selected));
  }, [selected]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const isCurrentWeek = weekStart === weekStartOf(today);

  return (
    <View style={{ gap: 8 }}>
      <View style={styles.row}>
        {days.map((d, i) => {
          const future = d > today;
          const ratio = future ? 0 : dayRatio(data, d);
          const isSel = d === selected;
          const complete = ratio >= 1;
          return (
            <Pressable
              key={d}
              onPress={() => onSelect(d)}
              style={[styles.pill, { width: pillW, height: PILL_H }, isSel && styles.pillSelected]}
            >
              <PillRing
                w={pillW}
                h={PILL_H}
                stroke={3.5}
                ratio={ratio}
                color={complete ? colors.accentText : colors.primary}
                track={future ? '#232325' : colors.border}
              />
              <Text style={[styles.num, future && styles.dim, isSel && { color: '#fff' }]}>{parseKey(d).getDate()}</Text>
              <Text style={[styles.dow, future && styles.dim]}>{WEEKDAYS[i]}</Text>
              {d === today && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.pager}>
        <Pressable hitSlop={10} onPress={() => setWeekStart(addDays(weekStart, -7))}>
          <Text style={styles.arrow}>‹</Text>
        </Pressable>
        <View style={[styles.pageDot, !isCurrentWeek && styles.pageDotOn]} />
        <View style={[styles.pageDot, isCurrentWeek && styles.pageDotOn]} />
        <Pressable hitSlop={10} disabled={isCurrentWeek} onPress={() => setWeekStart(addDays(weekStart, 7))}>
          <Text style={[styles.arrow, isCurrentWeek && { opacity: 0.25 }]}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: GAP },
  pill: { alignItems: 'center', justifyContent: 'center', borderRadius: 40 },
  pillSelected: { backgroundColor: '#3A3A3C' },
  num: { color: colors.text, fontSize: 17, fontWeight: '600' },
  dow: { color: colors.muted, fontSize: 13, marginTop: 2 },
  dim: { opacity: 0.45 },
  dot: { position: 'absolute', bottom: 7, width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff' },
  pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  pageDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  pageDotOn: { backgroundColor: '#fff' },
  arrow: { color: colors.muted, fontSize: 22, lineHeight: 22, paddingHorizontal: 6 },
});
