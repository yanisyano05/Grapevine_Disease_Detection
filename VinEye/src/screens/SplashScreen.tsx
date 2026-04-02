import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { RootStackParamList } from '@/types/navigation';

type SplashNav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashNav>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.leafEmoji}>🍃</Text>
      <Text style={styles.logo}>VinEye</Text>
      <Text style={styles.subtitle}>Détection de vignes par IA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[900],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  leafEmoji: { fontSize: 80 },
  logo: {
    fontSize: typography.fontSizes['4xl'],
    fontWeight: typography.fontWeights.extrabold,
    color: colors.primary[200],
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.primary[400],
    fontWeight: typography.fontWeights.medium,
  },
});
