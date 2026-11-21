import { Alert, Platform } from 'react-native';

type Button = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };

/**
 * Cross-platform Alert. React Native's Alert is a no-op on web, so there we fall back to
 * window.alert / window.confirm (confirm = OK runs the first non-cancel button).
 */
export function alert(title: string, message?: string, buttons?: Button[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const action = buttons?.find((b) => b.style !== 'cancel');
  if (buttons && buttons.length > 1) {
    if (window.confirm(text)) action?.onPress?.();
  } else {
    window.alert(text);
    action?.onPress?.();
  }
}
