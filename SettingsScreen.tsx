import { useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { alert } from '../alert';
import { DEFAULT_MODEL, starterData } from '../storage';
import { colors, shared } from '../theme';
import type { useHabitStore } from '../useHabitStore';

type Store = ReturnType<typeof useHabitStore>;

type Props = {
  store: Store;
  apiKey: string;
  model: string;
  onSaveKey: (k: string) => void;
  onSaveModel: (m: string) => void;
};

export function SettingsScreen({ store, apiKey, model, onSaveKey, onSaveModel }: Props) {
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [modelDraft, setModelDraft] = useState(model);
  const [importText, setImportText] = useState('');

  const exportBackup = () => {
    if (!store.data) return;
    const json = JSON.stringify(store.data);
    if (Platform.OS === 'web') {
      // Browsers: download a .json file.
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    Share.share({ title: 'Habit Quest backup', message: json });
  };

  const importBackup = () => {
    try {
      if (!store.replaceAll(JSON.parse(importText))) throw new Error('bad format');
      setImportText('');
      alert('Backup restored');
    } catch {
      alert('That does not look like a Habit Quest backup');
    }
  };

  const reset = () =>
    alert('Erase everything?', 'All habits, XP and history on this device will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: () => store.setData(starterData()) },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={shared.h1}>Settings</Text>

      <View style={[shared.card, { gap: 10 }]}>
        <Text style={shared.h2}>AI coach</Text>
        <Text style={shared.muted}>
          Your Anthropic API key stays on this device ({Platform.OS === 'web' ? 'browser storage' : 'secure keystore'}) and is only sent to api.anthropic.com.
        </Text>
        <TextInput
          style={shared.input}
          placeholder="sk-ant-…"
          placeholderTextColor={colors.muted}
          value={keyDraft}
          onChangeText={setKeyDraft}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
        />
        <TextInput
          style={shared.input}
          placeholder={DEFAULT_MODEL}
          placeholderTextColor={colors.muted}
          value={modelDraft}
          onChangeText={setModelDraft}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          style={shared.button}
          onPress={() => {
            onSaveKey(keyDraft.trim());
            onSaveModel(modelDraft.trim() || DEFAULT_MODEL);
            alert('Saved');
          }}
        >
          <Text style={shared.buttonText}>Save</Text>
        </Pressable>
      </View>

      <View style={[shared.card, { gap: 10 }]}>
        <Text style={shared.h2}>Backup</Text>
        <Text style={shared.muted}>
          Everything is saved on this device automatically every day. Export a copy to move it elsewhere.
        </Text>
        <Pressable style={shared.button} onPress={exportBackup}>
          <Text style={shared.buttonText}>Export backup</Text>
        </Pressable>
        <TextInput
          style={[shared.input, { minHeight: 70 }]}
          placeholder="Paste a backup here to restore"
          placeholderTextColor={colors.muted}
          value={importText}
          onChangeText={setImportText}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={[shared.button, { backgroundColor: colors.primaryDark }, !importText && { opacity: 0.5 }]} onPress={importBackup} disabled={!importText}>
          <Text style={shared.buttonText}>Restore from backup</Text>
        </Pressable>
      </View>

      <Pressable onPress={reset} style={{ alignItems: 'center', padding: 12 }}>
        <Text style={{ color: colors.danger, fontWeight: '700' }}>Erase all data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});
