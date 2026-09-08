import { describe, expect, it } from 'vitest';
import {
  tagCategoryInputSchema,
  tagCategoryNameSchema,
  tagInputSchema,
  normalizeTagCategoryName,
} from '@conjuros/contracts';

describe('tag category entity validation', () => {
  it('accepts alphanumeric names with dots and rejects anything else', () => {
    expect(tagCategoryNameSchema.safeParse('work').success).toBe(true);
    expect(tagCategoryNameSchema.safeParse('dev.ops').success).toBe(true);
    expect(tagCategoryNameSchema.safeParse('bad name').success).toBe(false);
    expect(tagCategoryNameSchema.safeParse('work!').success).toBe(false);
    expect(tagCategoryNameSchema.safeParse('work-tag').success).toBe(false);
  });

  it('trims category names and normalizes to lowercase via helper', () => {
    expect(tagCategoryInputSchema.parse({ name: '  Work  ' }).name).toBe('Work');
    expect(normalizeTagCategoryName(tagCategoryInputSchema.parse({ name: '  Work  ' }).name)).toBe('work');
    expect(normalizeTagCategoryName('DeV.Ops')).toBe('dev.ops');
  });

  it('defaults missing or blank tag categories to general', () => {
    expect(
      tagInputSchema.parse({ tagName: 'a.tag', description: '', color: '#123ABC' }).tagCategory,
    ).toBe('general');
    expect(
      tagInputSchema.parse({ tagName: 'a.tag', tagCategory: '   ', description: '', color: '#123ABC' })
        .tagCategory,
    ).toBe('general');
    expect(
      tagInputSchema.parse({ tagName: 'a.tag', tagCategory: 'Hobby', description: '', color: '#123ABC' })
        .tagCategory,
    ).toBe('Hobby');
  });

  it('rejects invalid category names on tag input', () => {
    expect(
      tagInputSchema.safeParse({ tagName: 'a.tag', tagCategory: 'bad category!', description: '', color: '#123ABC' })
        .success,
    ).toBe(false);
  });
});
