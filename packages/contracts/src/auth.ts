import { z } from 'zod';

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const passwordSchema = z.string().min(12).max(128);
export const themePreferenceSchema = z.enum(['light', 'dark']);

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const roleSchema = z.enum(['user', 'admin']);

export const authenticatedUserSchema = z.object({
  id: z.string().min(1),
  email: emailSchema,
});

export const authenticatedUserProfileSchema = authenticatedUserSchema.extend({
  theme: themePreferenceSchema,
  role: roleSchema,
});

export const themePreferenceUpdateSchema = z.object({
  theme: themePreferenceSchema,
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type ThemePreference = z.infer<typeof themePreferenceSchema>;
export type Role = z.infer<typeof roleSchema>;
export type AuthenticatedUserProfile = z.infer<typeof authenticatedUserProfileSchema>;
export type ThemePreferenceUpdate = z.infer<typeof themePreferenceUpdateSchema>;