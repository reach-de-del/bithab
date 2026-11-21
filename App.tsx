import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { alert } from './src/alert';
import { HabitModal } from './src/components/HabitModal';
import { Toast } from './src/components/Toast';
import { WeekStrip } from './src/components/WeekStrip';
import { parseKey } from './src/dates';
import { CoachScreen } from './src/screens/CoachScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { MoreScreen } from './src/screens/MoreScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { DEFAULT_MODEL, loadApiKey, loadSettings, saveApiKey, saveSettings } from './src/storage';
import { colors } from './src/theme';
import type { Habit } from './src/types';
import { useHabitStore } from './src/useHabitStore';

type Tab = 'dashboard' | 'habits' | 'coach' | 'more';

export default function App() {
  const store = useHabitStore();
  const { data, today } = store;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [picked, setPicked] = useState<string | null>(null); // null = follow today
  const date = picked ?? today;

  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [toast, setToast] = useState({ message: '', id: 0 });

  useEffect(() => {
    loadApiKey().then(setApiKey);
    loadSettings().then((s) => setModel(s.model));
  }, []);

  const handleToggle = (id: string) => {
    const r = store.toggle(id, date);
    if (!r) return;
    if (r.delta !== 0) {
      const msg = `${r.delta > 0 ? '+' : ''}${r.delta} XP${r.perfect ? '  ·  Perfect day! 🎉' : ''}`;
      setToast((t) => ({ message: msg, id: t.id + 1 }));
    }
    if (r.levelUp) alert('🎉 Level up!', `You reached level ${r.levelUp}. Keep going!`);
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (h: Habit) => {
    setEditing(h);
    setModalOpen(true);
  };
  const askCoach = (p: string) => {
    setPendingPrompt(p);
    setTab('coach');
  };

  const showHeader = tab === 'dashboard' || tab === 'habits';
  const title =
    date === today
      ? 'TODAY'
      : parseKey(date).toLocaleDateString(undefined, { weekday: 'long' }).toUpperCase();

  return (
    <SafeAreaProvider>
      <View style={styles.outer}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="light" />

        {showHeader && data && (
          <View style={styles.header}>
            <View style={styles.headRow}>
              <Text style={styles.title}>{title}</Text>
              <Pressable style={styles.circleBtn} onPress={() => setPicked(null)} accessibilityLabel="Jump to today">
                <Text style={{ fontSize: 18 }}>📅</Text>
              </Pressable>
              <Pressable style={styles.circleBtn} onPress={() => setTab('more')} accessibilityLabel="More">
                <Text style={{ fontSize: 18, color: colors.text, fontWeight: '900' }}>⋮</Text>
              </Pressable>
            </View>
            <WeekStrip data={data} selected={date} today={today} onSelect={setPicked} />
          </View>
        )}

        <View style={{ flex: 1 }}>
          {data && tab === 'dashboard' && (
            <DashboardScreen data={data} date={date} today={today} onToggle={handleToggle} onAskCoach={askCoach} />
          )}
          {data && tab === 'habits' && (
            <TodayScreen
              data={data}
              date={date}
              today={today}
              onToggle={handleToggle}
              onEdit={openEdit}
              onAdd={openNew}
              onAskCoach={askCoach}
            />
          )}
          {tab === 'coach' && (
            <CoachScreen
              data={data}
              today={today}
              apiKey={apiKey}
              model={model}
              pendingPrompt={pendingPrompt}
              clearPending={() => setPendingPrompt(null)}
              goSettings={() => setTab('more')}
            />
          )}
          {tab === 'more' && (
            <MoreScreen
              store={store}
              apiKey={apiKey}
              model={model}
              onSaveKey={(k) => {
                setApiKey(k);
                saveApiKey(k).catch(() => {});
              }}
              onSaveModel={(m) => {
                setModel(m);
                saveSettings({ model: m }).catch(() => {});
              }}
            />
          )}
          <Toast message={toast.message} id={toast.id} />
        </View>

        <View style={styles.tabBar}>
          <TabButton icon="📊" label="Dashboard" active={tab === 'dashboard'} onPress={() => setTab('dashboard')} />
          <TabButton icon="✅" label="Habits" active={tab === 'habits'} onPress={() => setTab('habits')} />
          <View style={styles.tab}>
            <Pressable style={styles.plus} onPress={openNew} accessibilityLabel="Add habit">
              <Text style={styles.plusText}>+</Text>
            </Pressable>
          </View>
          <TabButton icon="✨" label="Coach" active={tab === 'coach'} onPress={() => setTab('coach')} />
          <TabButton icon="⋯" label="More" active={tab === 'more'} onPress={() => setTab('more')} />
        </View>

        <HabitModal
          visible={modalOpen}
          habit={editing}
          onClose={() => setModalOpen(false)}
          onSave={(vals) => {
            if (editing) store.updateHabit(editing.id, vals);
            else store.addHabit(vals);
            setModalOpen(false);
          }}
          onArchive={(id) => {
            store.archiveHabit(id);
            setModalOpen(false);
          }}
        />
      </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

function TabButton({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tab} onPress={onPress}>
      <Text style={{ fontSize: 22, opacity: active ? 1 : 0.5 }}>{icon}</Text>
      <Text style={[styles.tabLabel, active && { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // On desktop browsers keep the phone-shaped column centred.
  outer: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  root: { flex: 1, width: '100%', maxWidth: Platform.OS === 'web' ? 520 : undefined, backgroundColor: colors.bg },
  header: { backgroundColor: colors.card, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, gap: 12 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 0.5 },
  circleBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingVertical: 6,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: colors.muted },
  plus: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  plusText: { fontSize: 34, lineHeight: 38, color: '#000', fontWeight: '300' },
});
