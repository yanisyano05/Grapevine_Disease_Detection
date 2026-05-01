import { z } from 'zod';

export function userFormSchema(t: (key: string) => string) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, { message: t('auth.errors.nameTooShort') })
      .max(50, { message: t('auth.errors.nameTooLong') }),
    email: z
      .string()
      .trim()
      .email({ message: t('auth.errors.emailInvalid') }),
  });
}

export type UserFormInput = z.infer<ReturnType<typeof userFormSchema>>;
