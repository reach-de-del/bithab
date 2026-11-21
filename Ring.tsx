import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

/** Circular progress ring with optional centre content. */
export function Ring({
  size,
  stroke,
  ratio,
  color = colors.primary,
  track = colors.surface,
  children,
}: {
  size: number;
  stroke: number;
  ratio: number;
  color?: string;
  track?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {clamped > 0 && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${c * clamped} ${c}`}
            // start at 12 o'clock
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

/**
 * Pill (stadium) shaped progress outline, starting at the top-centre and running clockwise,
 * like the per-day rings in a calendar strip.
 */
export function PillRing({
  w,
  h,
  stroke,
  ratio,
  color = colors.primary,
  track = colors.border,
}: {
  w: number;
  h: number;
  stroke: number;
  ratio: number;
  color?: string;
  track?: string;
}) {
  const i = stroke / 2;
  const r = w / 2 - i;
  const d = [
    `M ${w / 2} ${i}`,
    `A ${r} ${r} 0 0 1 ${w - i} ${w / 2}`,
    `V ${h - w / 2}`,
    `A ${r} ${r} 0 0 1 ${w / 2} ${h - i}`,
    `A ${r} ${r} 0 0 1 ${i} ${h - w / 2}`,
    `V ${w / 2}`,
    `A ${r} ${r} 0 0 1 ${w / 2} ${i}`,
  ].join(' ');
  const perimeter = 2 * Math.PI * r + 2 * (h - w);
  const clamped = Math.max(0, Math.min(1, ratio));
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Path d={d} stroke={track} strokeWidth={stroke} fill="none" />
      {clamped > 0 && (
        <Path
          d={d}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${perimeter * clamped} ${perimeter}`}
        />
      )}
    </Svg>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
