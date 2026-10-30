import { z } from 'zod';

export const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');
export const userPreferencesSchema = z.object({
  themeId: z.string().min(1).max(128).nullable(),
  tagsPanelExpanded: z.boolean(),
});

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(128, 'Password must be at most 128 characters');

export const loginCredentialsSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export const roleSchema = z.enum(['user', 'admin']);

export const authenticatedUserSchema = z.object({
  id: z.string().min(1),
  email: emailSchema,
});

export const authenticatedUserProfileSchema = authenticatedUserSchema.extend({
  role: roleSchema,
  preferences: userPreferencesSchema,
});

export const userPreferencesUpdateSchema = z
  .object({
    themeId: z.string().min(1).max(128).nullable().optional(),
    tagsPanelExpanded: z.boolean().optional(),
  })
  .refine((value) => value.themeId !== undefined || value.tagsPanelExpanded !== undefined, 'At least one preference must be provided');

export type Credentials = z.infer<typeof credentialsSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type Role = z.infer<typeof roleSchema>;
export type AuthenticatedUserProfile = z.infer<typeof authenticatedUserProfileSchema>;
export type UserPreferencesUpdate = z.infer<typeof userPreferencesUpdateSchema>;