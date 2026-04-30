import { View, StyleSheet, Text } from 'react-native';

import { ProgressCircle } from '@/components/ui/ProgressCircle';

interface ConfidenceTileProps {
  confidence: number;
  fillColor: string;
  arcColor?: string;
  size?: number;
  scoreSize?: number;
}

export function ConfidenceTile({
  confidence,
  fillColor,
  arcColor,
  size = 64,
  scoreSize = 18,
}: ConfidenceTileProps) {
  const score = Math.round(confidence * 100);
  const stroke = arcColor ?? darken(fillColor, 0.32);

  return (
    <View
      style={[
        styles.wrapper,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: fillColor },
      ]}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <ProgressCircle
          size={size}
          strokeWidth={Math.max(4, Math.round(size * 0.09))}
          progress={confidence}
          color={stroke}
          trackColor="rgba(255,255,255,0.35)"
        />
      </View>
      <Text style={[styles.score, { fontSize: scoreSize }]}>{score}</Text>
    </View>
  );
}

function darken(hex: string, ratio: number): string {
  const m = hex.replace('#', '').match(/.{1,2}/g);
  if (!m || m.length < 3) return hex;
  const [r, g, b] = m.map((c) => parseInt(c, 16));
  const dr = Math.max(0, Math.round(r * (1 - ratio)));
  const dg = Math.max(0, Math.round(g * (1 - ratio)));
  const db = Math.max(0, Math.round(b * (1 - ratio)));
  return `#${[dr, dg, db].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});
