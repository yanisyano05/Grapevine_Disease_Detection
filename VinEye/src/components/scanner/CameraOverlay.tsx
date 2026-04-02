import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { DetectionFrame } from './DetectionFrame';
import { ConfidenceMeter } from './ConfidenceMeter';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import { spacing } from '@/theme/spacing';

interface CameraOverlayProps {
  isScanning: boolean;
  confidence: number;
}

export function CameraOverlay({ isScanning, confidence }: CameraOverlayProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Center frame — dashed rectangle Figma style */}
      <View style={styles.centerSection}>
        <DetectionFrame size={260} active={isScanning} />
      </View>

      {/* Bottom — subtle confidence if scanning */}
      {isScanning && confidence > 0 && (
        <View style={styles.bottomSection}>
          <ConfidenceMeter confidence={confidence} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    position: 'absolute',
    bottom: spacing['5xl'],
    left: spacing.xl,
    right: spacing.xl,
  },
});
