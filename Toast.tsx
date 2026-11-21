import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

/** Brief floating message. Pass a new `id` each time to replay it. */
export function Toast({ message, id }: { message: string; id: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!id) return;
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [id, anim]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
