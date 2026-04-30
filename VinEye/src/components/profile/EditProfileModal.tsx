import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
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

  const trimmedName = displayName.trim();
  const trimmedEmail = email.trim();
  const isDirty =
    trimmedName !== initialProfile.displayName.trim() ||
    trimmedEmail !== initialProfile.email.trim() ||
    avatar !== initialProfile.avatar;

  function handleSave() {
    if (!isDirty) return;

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
      backgroundStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.neutral[300],
        width: 40,
        height: 4,
      }}
      containerStyle={{ zIndex: 100, elevation: 100 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 4,
          paddingBottom: insets.bottom + 24,
          gap: 12,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-[#1B1B1B]">
            {t('profile.editTitle')}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={10}
            className="w-8 h-8 rounded-full items-center justify-center bg-[#FAFAFA]"
          >
            <X size={18} color={colors.neutral[600]} />
          </Pressable>
        </View>

        <Text className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-[1px] mt-3 mb-2">
          {t('profile.avatarLabel')}
        </Text>
        <View className="flex-row flex-wrap gap-2.5">
          {AVATAR_OPTIONS.map((option) => {
            const selected = option === avatar;
            return (
              <Pressable
                key={option}
                onPress={() => setAvatar(option)}
                className={`w-[52px] h-[52px] rounded-full items-center justify-center border-2 ${
                  selected
                    ? 'bg-[#E9F5EC] border-primary'
                    : 'bg-[#F8F9FA] border-transparent'
                }`}
              >
                <Text
                  className="text-[28px] text-center"
                  style={{ lineHeight: 36, includeFontPadding: false }}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-[1px] mt-3 mb-2">
          {t('profile.nameField')}
        </Text>
        <BottomSheetTextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder={t('profile.namePlaceholder')}
          placeholderTextColor={colors.neutral[400]}
          maxLength={64}
          returnKeyType="next"
          style={{
            borderWidth: 1,
            borderColor: colors.neutral[300],
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            fontSize: 16,
            color: colors.neutral[900],
            backgroundColor: '#FAFAFA',
          }}
        />

        <Text className="text-xs font-semibold text-[#9E9E9E] uppercase tracking-[1px] mt-3 mb-2">
          {t('profile.emailField')}
        </Text>
        <BottomSheetTextInput
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
          style={{
            borderWidth: 1,
            borderColor: colors.neutral[300],
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 14,
            fontSize: 16,
            color: colors.neutral[900],
            backgroundColor: '#FAFAFA',
          }}
        />

        <View className="flex-row pt-5 gap-3">
          <Pressable
            onPress={onClose}
            className="flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-[#F5F5F5] border-[1.5px] border-[#BDBDBD] active:opacity-70"
          >
            <View className="flex-row items-center">
              <X size={18} color={colors.neutral[800]} strokeWidth={2.4} />
              <Text className="text-base font-bold text-[#2D2D2D] ml-2 tracking-[0.2px]">
                {t('common.cancel')}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={handleSave}
            disabled={!isDirty}
            className={
              isDirty
                ? 'flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-primary active:opacity-85'
                : 'flex-1 min-h-[56px] rounded-[14px] py-4 px-3 items-center justify-center bg-primary/40'
            }
          >
            <View className="flex-row items-center">
              <Check
                size={18}
                color="#FFFFFF"
                strokeWidth={2.6}
                opacity={isDirty ? 1 : 0.7}
              />
              <Text className="text-base font-bold text-white ml-2 tracking-[0.2px]">
                {t('profile.saveButton')}
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
