import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { useHabitStore } from '../useHabitStore';
import { ProgressScreen } from './ProgressScreen';
import { SettingsScreen } from './SettingsScreen';

type Store = ReturnType<typeof useHabitStore>;

type Props = {
  store: Store;
  apiKey: string;
  model: string;
  onSaveKey: (k: string) => void;
  onSaveModel: (m: string) => void;
};

/** "More" tab: switch between Progress and Settings. */
export function MoreScreen(props: Props) {
  const [section, setSection] = useState<'progress' | 'settings'>('progress');
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.seg}>
        {(['progress', 'settings'] as const).map((s) => (
          <Pressable key={s} onPress={() => setSection(s)} style={[styles.segBtn, section === s && styles.segOn]}>
            <Text style={[styles.segText, section === s && { color: '#fff' }]}>{s === 'progress' ? '📈 Progress' : '⚙️ Settings'}</Text>
          </Pressable>
        ))}
      </View>
      {section === 'progress' ? <ProgressScreen store={props.store} /> : <SettingsScreen {...props} />}
    </View>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', margin: 16, marginBottom: 0, backgroundColor: colors.card, borderRadius: 14, padding: 4 },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 },
  segOn: { backgroundColor: colors.surface },
  segText: { color: colors.muted, fontWeight: '700' },
});
