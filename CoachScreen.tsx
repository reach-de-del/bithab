import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { askCoach, buildSystemPrompt } from '../ai';
import { colors, shared } from '../theme';
import type { AppData, ChatMessage } from '../types';

const QUICK = [
  'Plan my day around my habits',
  "I'm unmotivated — help",
  'Suggest 3 new habits for me',
  'How can I keep my streak going?',
];

type Props = {
  data: AppData | null;
  today: string;
  apiKey: string;
  model: string;
  pendingPrompt: string | null;
  clearPending: () => void;
  goSettings: () => void;
};

export function CoachScreen({ data, today, apiKey, model, pendingPrompt, clearPending, goSettings }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy || !data) return;
    const next: ChatMessage[] = [...messagesRef.current, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const reply = await askCoach({
        apiKey,
        model,
        system: buildSystemPrompt(data, today),
        messages: next.slice(-12),
      });
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages([...next, { role: 'assistant', content: `⚠️ Couldn't reach the coach: ${msg}` }]);
    } finally {
      setBusy(false);
    }
  };

  // A ✨ tap on Today hands its prompt over here.
  useEffect(() => {
    if (pendingPrompt && apiKey && data) {
      clearPending();
      send(pendingPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt, apiKey, data]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages, busy]);

  if (!apiKey) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48 }}>✨</Text>
        <Text style={shared.h2}>Meet Quest, your AI coach</Text>
        <Text style={[shared.muted, { textAlign: 'center', marginVertical: 8 }]}>
          Add your Anthropic API key in Settings to get tiny-step plans, motivation and habit ideas based on your real
          progress.
        </Text>
        <Pressable style={[shared.button, { paddingHorizontal: 28 }]} onPress={goSettings}>
          <Text style={shared.buttonText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 6 }}>
            <Text style={shared.h1}>Coach ✨</Text>
            {messages.length === 0 && (
              <>
                <Text style={shared.muted}>Ask anything, or try one of these:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {QUICK.map((q) => (
                    <Pressable key={q} style={styles.chip} onPress={() => send(q)}>
                      <Text style={styles.chipText}>{q}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.bot]}>
            <Text style={{ color: item.role === 'user' ? '#fff' : colors.text, fontSize: 15, lineHeight: 21 }}>
              {item.content}
            </Text>
          </View>
        )}
        ListFooterComponent={busy ? <ActivityIndicator color={colors.primary} style={{ margin: 12 }} /> : undefined}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={[shared.input, { flex: 1 }]}
          placeholder="Ask your coach…"
          placeholderTextColor={colors.muted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <Pressable style={[styles.send, (!input.trim() || busy) && { opacity: 0.5 }]} onPress={() => send(input)}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  chip: { backgroundColor: colors.primarySoft, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  chipText: { color: colors.accentText, fontWeight: '700' },
  bubble: { maxWidth: '88%', borderRadius: 18, padding: 12 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  inputBar: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  send: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
});
