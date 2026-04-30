import { useEffect, useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react-native';
import { toast } from 'sonner-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/theme/colors';
import { AVATAR_OPTIONS, isValidEmail, type AvatarEmoji, type UserProfile } from '@/types/user';

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
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [email, setEmail] = useState(initialProfile.email);
  const [avatar, setAvatar] = useState<AvatarEmoji>(initialProfile.avatar);

  useEffect(() => {
    if (visible) {
      setDisplayName(initialProfile.displayName);
      setEmail(initialProfile.email);
      setAvatar(initialProfile.avatar);
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('profile.editTitle')}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={colors.neutral[600]} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>{t('profile.avatarLabel')}</Text>
            <View style={styles.avatarRow}>
              {AVATAR_OPTIONS.map((option) => {
                const selected = option === avatar;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setAvatar(option)}
                    style={[styles.avatarOption, selected && styles.avatarOptionSelected]}
                  >
                    <Text style={styles.avatarEmoji}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>{t('profile.nameField')}</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={colors.neutral[400]}
              maxLength={64}
              returnKeyType="next"
            />

            <Text style={styles.fieldLabel}>{t('profile.emailField')}</Text>
            <TextInput
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
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                styles.buttonGhost,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.buttonGhostLabel}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.button,
                styles.buttonPrimary,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.buttonPrimaryLabel}>{t('profile.saveButton')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 14,
    maxHeight: '90%',
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
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.neutral[900],
    backgroundColor: '#FAFAFA',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonGhost: {
    backgroundColor: colors.neutral[100],
  },
  buttonGhostLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  buttonPrimary: {
    backgroundColor: colors.primary[800],
  },
  buttonPrimaryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
