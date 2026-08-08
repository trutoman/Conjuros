import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearDraft,
  dedentSelection,
  draftKey,
  handleAutoClose,
  handleEnter,
  indentSelection,
  loadDraft,
  saveDraft,
} from '../markdownEditor';

describe('indentSelection', () => {
  it('inserts four spaces at the cursor when there is no selection', () => {
    const result = indentSelection('hello', 2, 2);
    expect(result.value).toBe('he    llo');
    expect(result.selectionStart).toBe(6);
    expect(result.selectionEnd).toBe(6);
  });

  it('indents every selected line when there is a selection', () => {
    const result = indentSelection('one\ntwo\nthree', 4, 8);
    expect(result.value).toBe('one\n    two\nthree');
    expect(result.selectionStart).toBe(4);
    expect(result.selectionEnd).toBe(11);
  });

  it('indents multiple selected lines', () => {
    const result = indentSelection('one\ntwo', 0, 7);
    expect(result.value).toBe('    one\n    two');
  });
});

describe('dedentSelection', () => {
  it('removes up to four leading spaces from the current line', () => {
    const result = dedentSelection('    hello', 7, 7);
    expect(result.value).toBe('hello');
    expect(result.selectionStart).toBe(3);
    expect(result.selectionEnd).toBe(3);
  });

  it('removes fewer spaces when the line is not fully indented', () => {
    const result = dedentSelection('  hello', 7, 7);
    expect(result.value).toBe('hello');
  });

  it('dedents every selected line', () => {
    const result = dedentSelection('    one\n    two', 0, 15);
    expect(result.value).toBe('one\ntwo');
  });
});

describe('handleEnter', () => {
  it('continues an unordered list with the same marker', () => {
    const result = handleEnter('- item', 6, 6);
    expect(result.value).toBe('- item\n- ');
    expect(result.selectionStart).toBe(9);
  });

  it('continues an ordered list with the next number', () => {
    const result = handleEnter('1. item', 7, 7);
    expect(result.value).toBe('1. item\n2. ');
  });

  it('exits the list when the current item is empty', () => {
    const result = handleEnter('- ', 2, 2);
    expect(result.value).toBe('\n');
  });

  it('continues a blockquote with a quote marker', () => {
    const result = handleEnter('> quote', 7, 7);
    expect(result.value).toBe('> quote\n> ');
  });

  it('preserves indentation for nested list items', () => {
    const result = handleEnter('    - item', 10, 10);
    expect(result.value).toBe('    - item\n    - ');
  });

  it('returns a plain newline for non-list lines', () => {
    const result = handleEnter('plain', 5, 5);
    expect(result.value).toBe('plain\n');
  });
});

describe('handleAutoClose', () => {
  it('auto-closes emphasis pairs', () => {
    const result = handleAutoClose('*', 1, 1);
    expect(result.value).toBe('**');
    expect(result.selectionStart).toBe(1);
  });

  it('auto-closes bold pairs', () => {
    const first = handleAutoClose('*', 1, 1);
    const second = handleAutoClose(`${first.value}*`, first.selectionStart + 1, first.selectionStart + 1);
    expect(second.value).toBe('****');
    expect(second.selectionStart).toBe(2);
  });

  it('auto-closes link brackets', () => {
    const result = handleAutoClose('[', 1, 1);
    expect(result.value).toBe('[]');
  });

  it('does not duplicate an existing closing marker', () => {
    const result = handleAutoClose('**bold***', 7, 7);
    expect(result.value).toBe('**bold**');
    expect(result.selectionStart).toBe(8);
  });
});

describe('draft helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('builds a namespaced key from the form id', () => {
    expect(draftKey('add')).toBe('conjuros_md_draft_add');
    expect(draftKey('item-1')).toBe('conjuros_md_draft_item-1');
  });

  it('saves and loads a draft', () => {
    saveDraft('add', '# Notes');
    expect(loadDraft('add')).toBe('# Notes');
  });

  it('returns null for a missing draft', () => {
    expect(loadDraft('add')).toBeNull();
  });

  it('clears a draft', () => {
    saveDraft('add', '# Notes');
    clearDraft('add');
    expect(loadDraft('add')).toBeNull();
  });

  it('tolerates storage failures', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(loadDraft('add')).toBeNull();
    expect(() => saveDraft('add', 'x')).not.toThrow();
    expect(() => clearDraft('add')).not.toThrow();
    getItem.mockRestore();
    setItem.mockRestore();
  });
});
