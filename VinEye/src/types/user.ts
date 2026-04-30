export type AvatarEmoji = '🧑‍🌾' | '👨‍🌾' | '👩‍🌾' | '🌱' | '🍇' | '🍷' | '🌿';

export interface UserProfile {
  displayName: string;
  email: string;
  avatar: AvatarEmoji;
}

export const AVATAR_OPTIONS: AvatarEmoji[] = [
  '🧑‍🌾',
  '👨‍🌾',
  '👩‍🌾',
  '🌱',
  '🍇',
  '🍷',
  '🌿',
];

export const DEFAULT_PROFILE: UserProfile = {
  displayName: '',
  email: '',
  avatar: '🧑‍🌾',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}
