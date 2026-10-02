import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  itemKinds,
  roleSchema,
  themePreferenceSchema,
  type IconAssets,
  type ThemeColors,
  type ThemeFonts,
  type ThemeFontSizes,
  type ThemeKindColors,
} from '@conjuros/contracts';

// Enum values come from the contract constants so the database and the API cannot drift apart.
export const itemKindEnum = pgEnum('item_kind', itemKinds);
export const userRoleEnum = pgEnum('user_role', roleSchema.options);
export const themePreferenceEnum = pgEnum('theme_preference', themePreferenceSchema.options);

const timestamptz = () => timestamp({ withTimezone: true, mode: 'date' });

export const users = pgTable('users', {
  id: text().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  theme: themePreferenceEnum().notNull().default('light'),
  role: userRoleEnum().notNull().default('user'),
  createdAt: timestamptz().notNull(),
});

const ownerId = () =>
  text()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' });

export const collectionItems = pgTable(
  'collection_items',
  {
    id: text().primaryKey(),
    ownerId: ownerId(),
    kind: itemKindEnum().notNull(),
    title: text().notNull(),
    description: text(),
    tags: text().array().notNull().default([]),
    relatedItemIds: text().array().notNull().default([]),
    // `order` is a reserved word in SQL; the TypeScript key and the API field keep the name.
    order: integer('position').notNull(),
    command: text(),
    url: text(),
    content: text(),
    filename: text(),
    createdAt: timestamptz().notNull(),
    updatedAt: timestamptz().notNull(),
  },
  (table) => [
    index('collection_items_owner_position_idx').on(table.ownerId, table.order),
    check(
      'collection_items_kind_fields_check',
      sql`(
        (${table.kind} = 'spell' AND ${table.command} IS NOT NULL AND ${table.url} IS NULL AND ${table.content} IS NULL AND ${table.filename} IS NULL)
        OR (${table.kind} = 'web-link' AND ${table.url} IS NOT NULL AND ${table.command} IS NULL AND ${table.content} IS NULL AND ${table.filename} IS NULL)
        OR (${table.kind} IN ('markdown', 'file') AND ${table.content} IS NOT NULL AND ${table.command} IS NULL AND ${table.url} IS NULL)
      )`,
    ),
  ],
);

export const tags = pgTable(
  'tags',
  {
    id: text().primaryKey(),
    ownerId: ownerId(),
    tagName: text().notNull(),
    tagNameNormalized: text().notNull(),
    description: text().notNull().default(''),
    color: text().notNull(),
    order: integer('position').notNull(),
    createdAt: timestamptz().notNull(),
    updatedAt: timestamptz().notNull(),
  },
  (table) => [
    // Not unique on purpose: the same tag name may exist in different categories.
    index('tags_owner_name_normalized_idx').on(table.ownerId, table.tagNameNormalized),
    index('tags_owner_position_idx').on(table.ownerId, table.order),
  ],
);

export const tagCategories = pgTable(
  'tag_categories',
  {
    id: text().primaryKey(),
    ownerId: ownerId(),
    name: text().notNull(),
    nameNormalized: text().notNull(),
    description: text().notNull().default(''),
    tagIds: text().array().notNull().default([]),
    order: integer('position').notNull(),
    createdAt: timestamptz().notNull(),
    updatedAt: timestamptz().notNull(),
  },
  (table) => [
    uniqueIndex('tag_categories_owner_name_normalized_idx').on(table.ownerId, table.nameNormalized),
  ],
);

export const themes = pgTable(
  'themes',
  {
    id: text().primaryKey(),
    name: text().notNull().unique(),
    label: text().notNull(),
    colors: jsonb().$type<ThemeColors>().notNull(),
    fontSizes: jsonb().$type<ThemeFontSizes>().notNull(),
    fonts: jsonb().$type<ThemeFonts>().notNull(),
    iconAssets: jsonb().$type<IconAssets>().notNull(),
    kindColors: jsonb().$type<ThemeKindColors>().notNull(),
    tagColorPalette: text().array().notNull(),
    isDefault: boolean().notNull().default(false),
    createdAt: timestamptz().notNull(),
    updatedAt: timestamptz().notNull(),
  },
  (table) => [
    // Every default row indexes the same value, so at most one theme can be the default.
    uniqueIndex('themes_single_default_idx')
      .on(table.isDefault)
      .where(sql`${table.isDefault}`),
  ],
);
