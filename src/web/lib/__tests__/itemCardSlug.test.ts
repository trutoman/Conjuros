import { describe, expect, it } from 'vitest';
import { markdownSlug, plainTextSlug } from '../itemCardSlug';

describe('markdownSlug', () => {
  it('returns an empty string for empty content', () => {
    expect(markdownSlug('')).toBe('');
  });

  it('returns an empty string for all-whitespace content', () => {
    expect(markdownSlug('   \n  \n ')).toBe('');
  });

  it('uses the first non-empty line, skipping leading blank lines', () => {
    expect(markdownSlug('\n\n# Notes\n\nBody')).toBe('Notes');
  });

  it('strips a heading marker', () => {
    expect(markdownSlug('# Heading')).toBe('Heading');
  });

  it('strips multiple heading levels', () => {
    expect(markdownSlug('###### Deep heading')).toBe('Deep heading');
  });

  it('strips unordered list markers', () => {
    expect(markdownSlug('- first item')).toBe('first item');
    expect(markdownSlug('* star item')).toBe('star item');
    expect(markdownSlug('+ plus item')).toBe('plus item');
  });

  it('strips ordered list markers', () => {
    expect(markdownSlug('1. first')).toBe('first');
    expect(markdownSlug('2) second')).toBe('second');
  });

  it('strips a blockquote marker', () => {
    expect(markdownSlug('> quoted line')).toBe('quoted line');
  });

  it('strips bold and emphasis markers', () => {
    expect(markdownSlug('Some **bold** text.')).toBe('Some bold text.');
    expect(markdownSlug('_emphasis_ here')).toBe('emphasis here');
  });

  it('strips inline code markers', () => {
    expect(markdownSlug('Use `npm install` now')).toBe('Use npm install now');
  });

  it('keeps link labels and drops the URL', () => {
    expect(markdownSlug('See [docs](https://example.com)')).toBe('See docs');
  });

  it('drops image syntax', () => {
    expect(markdownSlug('![alt](image.png) start')).toBe('start');
  });

  it('collapses internal whitespace', () => {
    expect(markdownSlug('a    b   c')).toBe('a b c');
  });

  it('handles a mixed markdown line', () => {
    expect(markdownSlug('- **# title** with `code`')).toBe('title with code');
  });
});

describe('plainTextSlug', () => {
  it('returns an empty string for empty content', () => {
    expect(plainTextSlug('')).toBe('');
  });

  it('returns an empty string for all-whitespace content', () => {
    expect(plainTextSlug('   \n  \n ')).toBe('');
  });

  it('uses the first non-empty line, skipping leading blank lines', () => {
    expect(plainTextSlug('\n\nfirst line\nsecond')).toBe('first line');
  });

  it('does not strip markdown markers from plain text', () => {
    expect(plainTextSlug('# heading')).toBe('# heading');
    expect(plainTextSlug('- list item')).toBe('- list item');
    expect(plainTextSlug('> quoted')).toBe('> quoted');
  });

  it('collapses internal whitespace', () => {
    expect(plainTextSlug('a    b   c')).toBe('a b c');
  });
});
