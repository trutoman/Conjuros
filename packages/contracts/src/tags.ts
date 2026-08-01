import { z } from 'zod';

export const tagNamePattern = /^[A-Za-z0-9.]+$/;
export const hexColorPattern = /^#[0-9A-Fa-f]{6}$/;

export const tagIdSchema = z.string().min(1).max(128);
export const tagNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(tagNamePattern, 'Tag name must use only alphanumeric characters and dots');
export const tagDescriptionSchema = z.string().trim().max(2_000);
export const tagColorSchema = z
  .string()
  .trim()
  .regex(hexColorPattern, 'Tag color must use the #RRGGBB format');

export const tagCategorySchema = z.string().trim().min(1).max(120);

export function normalizeTagName(tagName: string): string {
  return tagName.trim().toLowerCase();
}

export function normalizeTagCategory(tagCategory: string): string {
  return tagCategory.trim().toLowerCase();
}

export const tagInputSchema = z.object({
  tagName: tagNameSchema,
  tagCategory: tagCategorySchema,
  description: tagDescriptionSchema,
  color: tagColorSchema,
});

export const tagUpdateSchema = z
  .object({
    tagName: tagNameSchema.optional(),
    tagCategory: tagCategorySchema.optional(),
    description: tagDescriptionSchema.optional(),
    color: tagColorSchema.optional(),
  })
  .refine(
    (value) =>
      value.tagName !== undefined ||
      value.tagCategory !== undefined ||
      value.description !== undefined ||
      value.color !== undefined,
    'At least one field must be provided',
  );

export const tagSchema = z.object({
  id: tagIdSchema,
  tagName: tagNameSchema,
  tagCategory: tagCategorySchema,
  description: z.string(),
  color: tagColorSchema,
  order: z.number().int().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const tagQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(25),
  skip: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().max(200).optional(),
  sort: z.enum(['order', 'updatedAt', 'tagName', 'tagCategory']).default('order'),
});

export const tagListSchema = z.object({
  items: z.array(tagSchema),
  total: z.number().int().min(0),
});

export type TagInput = z.infer<typeof tagInputSchema>;
export type TagUpdate = z.infer<typeof tagUpdateSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type TagQuery = z.infer<typeof tagQuerySchema>;
