import { Modal, View, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/AuthContext';

export function BannedModal() {
  const { t } = useTranslation();
  const { isBanned, bannedReason, resetAccount } = useAuth();

  return (
    <Modal
      visible={isBanned}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // Non-dismissible: ignore back button on Android.
      }}
    >
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-[360px] rounded-3xl bg-white p-6 items-center">
          <View className="w-16 h-16 rounded-full items-center justify-center bg-red-50 mb-4">
            <ShieldAlert size={32} color="#DC2626" />
          </View>

          <Text className="text-xl font-bold text-[#1A1A1A] text-center">
            {t('auth.banned.title')}
          </Text>

          <Text className="mt-3 text-sm text-[#475569] leading-5 text-center">
            {bannedReason
              ? t('auth.banned.description', { reason: bannedReason })
              : t('auth.banned.descriptionNoReason')}
          </Text>

          <Pressable
            onPress={() => {
              void resetAccount();
            }}
            className="mt-6 w-full rounded-2xl bg-red-600 py-3.5 items-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">
              {t('auth.banned.cta')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
