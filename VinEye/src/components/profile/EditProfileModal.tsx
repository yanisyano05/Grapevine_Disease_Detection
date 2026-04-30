import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Text as RNText,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';
import {
  AVATAR_OPTIONS,
  isValidEmail,
  type AvatarEmoji,
  type UserProfile,
} from '@/types/user';

interface EditProfileModalProps {
  visible: boolean;
  initialProfile: UserProfile;
  onClose: () => void;
  onSave: (next: UserProfile) => void;
}

export function EditProfileModal({
  visible,
  initialProfile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['95%'], []);

  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [email, setEmail] = useState(initialProfile.email);
  const [avatar, setAvatar] = useState<AvatarEmoji>(initialProfile.avatar);

  useEffect(() => {
    if (visible) {
      setDisplayName(initialProfile.displayName);
      setEmail(initialProfile.email);
      setAvatar(initialProfile.avatar);
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [visible, initialProfile]);

  function handleSave() {
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (trimmedEmail.length > 0 && !isValidEmail(trimmedEmail)) {
      toast.error(t('profile.invalidEmail'));
      return;
    }

    onSave({
      displayName: trimmedName,
      email: trimmedEmail,
      avatar,
    });
    toast.success(t('profile.saved'));
    onClose();
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      topInset={insets.top + 8}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      onClose={onClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
      containerStyle={styles.container}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.editTitle')}</Text>
          <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
            <X size={18} color={colors.neutral[600]} />
          </Pressable>
        </View>

          <Text style={styles.fieldLabel}>{t('profile.avatarLabel')}</Text>
          <View style={styles.avatarRow}>
            {AVATAR_OPTIONS.map((option) => {
              const selected = option === avatar;
              return (
                <Pressable
                  key={option}
                  onPress={() => setAvatar(option)}
                  style={[
                    styles.avatarOption,
                    selected && styles.avatarOptionSelected,
                  ]}
                >
                  <Text style={styles.avatarEmoji}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>{t('profile.nameField')}</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('profile.namePlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            maxLength={64}
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>{t('profile.emailField')}</Text>
          <BottomSheetTextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('profile.emailPlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={128}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                styles.buttonGhost,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View style={styles.buttonInner}>
                <X size={18} color={colors.neutral[800]} strokeWidth={2.4} />
                <RNText style={styles.buttonGhostLabel}>
                  {t('common.cancel')}
                </RNText>
              </View>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.buttonInner}>
                <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
                <RNText style={styles.buttonPrimaryLabel}>
                  {t('profile.saveButton')}
                </RNText>
              </View>
            </Pressable>
          </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
    elevation: 100,
  },
  background: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    backgroundColor: colors.neutral[300],
    width: 40,
    height: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[900],
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarOption: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    backgroundColor: colors.primary[100],
    borderColor: colors.primary[800],
  },
  avatarEmoji: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    includeFontPadding: false,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: '#FAFAFA',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonGhost: {
    backgroundColor: colors.neutral[200],
    borderWidth: 1.5,
    borderColor: colors.neutral[400],
  },
  buttonGhostLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[800],
    letterSpacing: 0.2,
    marginLeft: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primary[800],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimaryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    marginLeft: 8,
  },
});
