import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { alert } from '../alert';
import { colors, shared } from '../theme';
import type { Habit } from '../types';
import { XP_CHOICES } from '../xp';

const EMOJIS = ['💪', '🏋️', '🏃', '💧', '😴', '📚', '🧘', '🥗', '✍️', '🧠', '🎯', '🎸', '🧹', '💊', '☀️', '🚭'];

type Props = {
  visible: boolean;
  habit: Habit | null; // null = creating
  onClose: () => void;
  onSave: (h: Pick<Habit, 'name' | 'emoji' | 'xp'>) => void;
  onArchive: (id: string) => void;
};

export function HabitModal({ visible, habit, onClose, onSave, onArchive }: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [xp, setXp] = useState(10);

  useEffect(() => {
    if (visible) {
      setName(habit?.name ?? '');
      setEmoji(habit?.emoji ?? EMOJIS[0]);
      setXp(habit?.xp ?? 10);
    }
  }, [visible, habit]);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return alert('Give your habit a name');
    onSave({ name: trimmed, emoji, xp });
  };

  const confirmArchive = () => {
    if (!habit) return;
    alert('Remove habit?', 'It disappears from Today. Your past XP and history are kept.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onArchive(habit.id) },
    ]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 14 }}>
            <Text style={shared.h2}>{habit ? 'Edit habit' : 'New habit'}</Text>

            <TextInput
              style={shared.input}
              placeholder="e.g. Read 20 pages"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              maxLength={60}
              autoFocus={!habit}
            />

            <Text style={shared.muted}>Icon</Text>
            <View style={styles.wrap}>
              {EMOJIS.map((e) => (
                <Pressable key={e} onPress={() => setEmoji(e)} style={[styles.emoji, emoji === e && styles.selected]}>
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={shared.muted}>XP reward (harder habit = more XP)</Text>
            <View style={styles.wrap}>
              {XP_CHOICES.map((v) => (
                <Pressable key={v} onPress={() => setXp(v)} style={[styles.xp, xp === v && styles.selected]}>
                  <Text style={{ fontWeight: '700', color: colors.text }}>+{v}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={shared.button} onPress={save}>
              <Text style={shared.buttonText}>{habit ? 'Save changes' : 'Add habit'}</Text>
            </Pressable>
            {habit && (
              <Pressable onPress={confirmArchive} style={{ alignItems: 'center', padding: 8 }}>
                <Text style={{ color: colors.danger, fontWeight: '600' }}>Remove habit</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emoji: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xp: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
});
