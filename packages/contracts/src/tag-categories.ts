import { z } from 'zod';

export const tagCategoryNamePattern = /^[A-Za-z0-9.]+$/;

export const DEFAULT_TAG_CATEGORY = 'general';

export const tagCategoryIdSchema = z.string().min(1).max(128);

export const tagCategoryNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(tagCategoryNamePattern, 'Tag category must use only alphanumeric characters and dots');

export function normalizeTagCategoryName(name: string): string {
  return name.trim().toLowerCase();
}

export const tagCategoryDescriptionSchema = z.string().trim().max(2_000);

export const tagCategoryInputSchema = z.object({
  name: tagCategoryNameSchema,
  description: tagCategoryDescriptionSchema.optional().default(''),
});

export const tagCategoryUpdateSchema = z
  .object({
    name: tagCategoryNameSchema.optional(),
    description: tagCategoryDescriptionSchema.optional(),
  })
  .refine(
    (value) => value.name !== undefined || value.description !== undefined,
    'At least one field must be provided',
  );

export const tagCategoryEntitySchema = z.object({
  id: tagCategoryIdSchema,
  name: tagCategoryNameSchema,
  description: z.string(),
  tagIds: z.array(z.string()),
  tagCount: z.number().int().min(0),
  order: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const tagCategoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(25),
  skip: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().max(200).optional(),
  sort: z.enum(['order', 'updatedAt', 'name']).default('order'),
});

export const tagCategoryListSchema = z.object({
  items: z.array(tagCategoryEntitySchema),
  total: z.number().int().min(0),
});

export type TagCategoryInput = z.infer<typeof tagCategoryInputSchema>;
export type TagCategoryUpdate = z.infer<typeof tagCategoryUpdateSchema>;
export type TagCategory = z.infer<typeof tagCategoryEntitySchema>;
export type TagCategoryQuery = z.infer<typeof tagCategoryQuerySchema>;
