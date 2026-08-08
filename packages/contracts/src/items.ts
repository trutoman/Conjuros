import { z } from 'zod';
import { normalizeTagName, tagNameSchema } from './tags';

export const itemKinds = ['spell', 'web-link', 'markdown'] as const;

export const itemKindSchema = z.enum(itemKinds);
export const itemIdSchema = z.string().min(1).max(128);
export const tagValueSchema = tagNameSchema.transform(normalizeTagName);
export const tagFilterModeSchema = z.enum(['all', 'any']);

export function normalizeTags(tags: readonly string[]): string[] {
  return [...new Set(tags.map((tag) => normalizeTagName(tag)).filter(Boolean))];
}

const commonItemFields = {
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2_000),
  tags: z.array(z.string()).max(10).transform(normalizeTags).pipe(z.array(tagValueSchema).max(10)),
  relatedItemIds: z.array(itemIdSchema).max(20).transform((ids) => [...new Set(ids)]),
};

export const spellInputSchema = z.object({
  kind: z.literal('spell'),
  ...commonItemFields,
  command: z.string().min(1).max(10_000),
});

export const webLinkInputSchema = z.object({
  kind: z.literal('web-link'),
  ...commonItemFields,
  url: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//i.test(value), 'URL must use the http or https protocol'),
});

export const markdownInputSchema = z.object({
  kind: z.literal('markdown'),
  ...commonItemFields,
  content: z.string().trim().min(1),
});

export const collectionItemInputSchema = z.discriminatedUnion('kind', [
  spellInputSchema,
  webLinkInputSchema,
  markdownInputSchema,
]);

export const collectionItemUpdateSchema = z
  .object({
    kind: itemKindSchema.optional(),
    title: commonItemFields.title.optional(),
    description: commonItemFields.description.optional(),
    tags: commonItemFields.tags.optional(),
    relatedItemIds: commonItemFields.relatedItemIds.optional(),
    command: z.string().min(1).max(10_000).optional(),
    url: webLinkInputSchema.shape.url.optional(),
    content: markdownInputSchema.shape.content.optional(),
  })
  .superRefine((value, context) => {
    if (value.kind === 'spell' && value.url !== undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Spell updates cannot include a URL' });
    }
    if (value.kind === 'spell' && value.content !== undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Spell updates cannot include content' });
    }
    if (value.kind === 'web-link' && value.command !== undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Web-link updates cannot include a command' });
    }
    if (value.kind === 'web-link' && value.content !== undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Web-link updates cannot include content' });
    }
    if (value.kind === 'markdown' && value.command !== undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Markdown updates cannot include a command' });
    }
    if (value.kind === 'markdown' && value.url !== undefined) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Markdown updates cannot include a URL' });
    }
  });

export const collectionItemSchema = z.object({
  id: itemIdSchema,
  kind: itemKindSchema,
  title: z.string(),
  description: z.string(),
  tags: z.array(tagValueSchema),
  order: z.number().int().positive(),
  relatedItemIds: z.array(itemIdSchema),
  command: z.string().nullable(),
  url: z.string().url().nullable(),
  content: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const collectionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(25),
  skip: z.coerce.number().int().min(0).default(0),
  search: z.string().trim().max(200).optional(),
  kind: itemKindSchema.optional(),
  tags: z
    .preprocess(
      (value) => {
        if (value === undefined || value === null || value === '') return undefined;
        return Array.isArray(value) ? value : [value];
      },
      z.array(z.string()).max(10).transform(normalizeTags),
    )
    .optional(),
  tagFilterMode: tagFilterModeSchema.default('all'),
  sort: z.enum(['order', 'updatedAt', 'title']).default('order'),
});

export const reorderItemSchema = z.object({
  order: z.number().int().positive(),
});

export const collectionListSchema = z.object({
  items: z.array(collectionItemSchema),
  total: z.number().int().min(0),
});

export type ItemKind = z.infer<typeof itemKindSchema>;
export type ItemTag = z.infer<typeof tagValueSchema>;
export type CollectionItemInput = z.infer<typeof collectionItemInputSchema>;
export type CollectionItemUpdate = z.infer<typeof collectionItemUpdateSchema>;
export type CollectionItem = z.infer<typeof collectionItemSchema>;
export type CollectionQuery = z.infer<typeof collectionQuerySchema>;
export type ReorderItemInput = z.infer<typeof reorderItemSchema>;