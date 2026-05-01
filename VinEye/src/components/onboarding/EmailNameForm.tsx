import { useEffect, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User as UserIcon, Mail } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { userFormSchema, type UserFormInput } from '@/services/auth/authValidation';
import { colors } from '@/theme/colors';

interface EmailNameFormProps {
  onSubmit: (values: UserFormInput) => void | Promise<void>;
  submitting?: boolean;
}

interface FieldErrors {
  name?: string;
  email?: string;
}

export function EmailNameForm({
  onSubmit,
  submitting = false,
}: EmailNameFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ name: boolean; email: boolean }>({
    name: false,
    email: false,
  });

  const schema = useMemo(() => userFormSchema(t), [t]);

  // Live validation
  useEffect(() => {
    const result = schema.safeParse({ name, email });
    if (result.success) {
      setErrors({});
    } else {
      const next: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if ((key === 'name' || key === 'email') && !next[key]) {
          next[key] = issue.message;
        }
      }
      setErrors(next);
    }
  }, [name, email, schema]);

  const isValid = Object.keys(errors).length === 0 && name.length > 0 && email.length > 0;

  function handleSubmit() {
    setTouched({ name: true, email: true });
    if (!isValid) return;
    void onSubmit({ name: name.trim(), email: email.trim() });
  }

  return (
    <View className="gap-3 w-full">
      {/* Name */}
      <View>
        <View className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-4 border border-gray-100">
          <UserIcon size={18} color={colors.neutral[500]} />
          <TextInput
            value={name}
            onChangeText={setName}
            onBlur={() => setTouched((p) => ({ ...p, name: true }))}
            placeholder={t('onboarding.authChoice.namePlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={50}
            className="flex-1 text-[15px] text-[#1A1A1A]"
            style={{
              paddingVertical: 0,
              textAlignVertical: 'center',
              includeFontPadding: false,
            }}
          />
        </View>
        {touched.name && errors.name ? (
          <Text className="mt-1 ml-1 text-xs text-red-600">{errors.name}</Text>
        ) : null}
      </View>

      {/* Email */}
      <View>
        <View className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-4 border border-gray-100">
          <Mail size={18} color={colors.neutral[500]} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            placeholder={t('onboarding.authChoice.emailPlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={128}
            className="flex-1 text-[15px] text-[#1A1A1A]"
            style={{
              paddingVertical: 0,
              textAlignVertical: 'center',
              includeFontPadding: false,
            }}
          />
        </View>
        {touched.email && errors.email ? (
          <Text className="mt-1 ml-1 text-xs text-red-600">{errors.email}</Text>
        ) : null}
      </View>

      <View className="mt-2">
        <OnboardingButton
          variant="primary"
          disabled={!isValid}
          loading={submitting}
          onPress={handleSubmit}
        >
          {t('onboarding.authChoice.createAccount')}
        </OnboardingButton>
      </View>
    </View>
  );
}
