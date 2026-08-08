export interface EditResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export const INDENT = '    ';
export const DRAFT_PREFIX = 'conjuros_md_draft_';

export function applyEdit(edit: EditResult): EditResult {
  const max = edit.value.length;
  return {
    value: edit.value,
    selectionStart: Math.max(0, Math.min(edit.selectionStart, max)),
    selectionEnd: Math.max(0, Math.min(edit.selectionEnd, max)),
  };
}

function lineStartOf(value: string, index: number): number {
  return value.lastIndexOf('\n', index - 1) + 1;
}

function lineEndOf(value: string, index: number): number {
  const newline = value.indexOf('\n', index);
  return newline === -1 ? value.length : newline;
}

export function indentSelection(value: string, start: number, end: number): EditResult {
  if (start === end) {
    return {
      value: value.slice(0, start) + INDENT + value.slice(end),
      selectionStart: start + INDENT.length,
      selectionEnd: start + INDENT.length,
    };
  }

  const lineStart = lineStartOf(value, start);
  const lastIndex = Math.max(start, end - 1);
  const lineEnd = lineEndOf(value, lastIndex);

  const block = value.slice(lineStart, lineEnd);
  const indented = block.replace(/^/gm, INDENT);
  return {
    value: value.slice(0, lineStart) + indented + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + indented.length,
  };
}

function leadingSpaces(line: string): number {
  return line.match(/^ */)?.[0].length ?? 0;
}

export function dedentSelection(value: string, start: number, end: number): EditResult {
  if (start === end) {
    const lineStart = lineStartOf(value, start);
    const line = value.slice(lineStart, lineEndOf(value, start));
    const remove = Math.min(leadingSpaces(line), INDENT.length);
    return {
      value: value.slice(0, lineStart) + line.slice(remove) + value.slice(lineStart + line.length),
      selectionStart: Math.max(lineStart, start - remove),
      selectionEnd: Math.max(lineStart, start - remove),
    };
  }

  const lineStart = lineStartOf(value, start);
  const lastIndex = Math.max(start, end - 1);
  const lineEnd = lineEndOf(value, lastIndex);

  const block = value.slice(lineStart, lineEnd);
  const dedented = block
    .split('\n')
    .map((line) => line.slice(Math.min(leadingSpaces(line), INDENT.length)))
    .join('\n');
  return {
    value: value.slice(0, lineStart) + dedented + value.slice(lineEnd),
    selectionStart: lineStart,
    selectionEnd: lineStart + dedented.length,
  };
}

export function handleEnter(value: string, start: number, end: number): EditResult {
  const lineStart = lineStartOf(value, start);
  const lineEnd = lineEndOf(value, start);
  const before = value.slice(lineStart, start);
  const after = value.slice(end, lineEnd);

  const indent = before.match(/^\s*/)?.[0] ?? '';
  const rest = before.slice(indent.length);

  let marker: string | null = null;
  let orderedNumber: number | null = null;
  let contentAfterMarker = rest;

  const unordered = rest.match(/^([-*+])\s+(.*)$/);
  if (unordered) {
    marker = unordered[1];
    contentAfterMarker = unordered[2];
  } else {
    const ordered = rest.match(/^(\d+)\.\s?(.*)$/);
    if (ordered) {
      marker = '.';
      orderedNumber = Number.parseInt(ordered[1], 10);
      contentAfterMarker = ordered[2];
    } else {
      const quote = rest.match(/^>\s?(.*)$/);
      if (quote) {
        marker = '>';
        contentAfterMarker = quote[1];
      }
    }
  }

  if (marker === null) {
    return {
      value: value.slice(0, start) + '\n' + value.slice(end),
      selectionStart: start + 1,
      selectionEnd: start + 1,
    };
  }

  const isEmptyItem = contentAfterMarker.trim() === '' && after.trim() === '';

  if (isEmptyItem) {
    return {
      value: value.slice(0, lineStart) + indent + '\n' + value.slice(lineEnd),
      selectionStart: lineStart + indent.length + 1,
      selectionEnd: lineStart + indent.length + 1,
    };
  }

  const nextMarker = orderedNumber !== null ? `${orderedNumber + 1}.` : marker;
  const newLine = indent + nextMarker + ' ';
  return {
    value: value.slice(0, start) + '\n' + newLine + value.slice(end),
    selectionStart: start + 1 + newLine.length,
    selectionEnd: start + 1 + newLine.length,
  };
}

const AUTO_CLOSE: Record<string, string> = {
  '*': '*',
  '_': '_',
  '`': '`',
  '[': ']',
  '(': ')',
  '>': '>',
};

export function handleAutoClose(value: string, start: number, end: number): EditResult {
  if (end !== start || start === 0) {
    return { value, selectionStart: start, selectionEnd: end };
  }

  const typed = value[start - 1];
  const prev = start >= 2 ? value[start - 2] : '';

  let close: string | null = null;
  if (typed === '*' && prev === '*') {
    close = '**';
  } else if (typed === '~' && prev === '~') {
    close = '~~';
  } else if (typed in AUTO_CLOSE) {
    close = AUTO_CLOSE[typed];
  }

  if (close === null) {
    return { value, selectionStart: start, selectionEnd: end };
  }

  const afterText = value.slice(start);
  let matched = 0;
  while (matched < close.length && afterText[matched] === close[matched]) {
    matched += 1;
  }

  if (matched === close.length) {
    const newValue = value.slice(0, start - 1) + value.slice(start);
    let cursor = start - 1;
    while (cursor < newValue.length && newValue[cursor] === close[0]) {
      cursor += 1;
    }
    return { value: newValue, selectionStart: cursor, selectionEnd: cursor };
  }

  const remainder = close.slice(matched);
  return {
    value: value.slice(0, start) + remainder + value.slice(start),
    selectionStart: start,
    selectionEnd: start,
  };
}

export function draftKey(formId: string): string {
  return `${DRAFT_PREFIX}${formId}`;
}

export function loadDraft(formId: string): string | null {
  try {
    return localStorage.getItem(draftKey(formId));
  } catch {
    return null;
  }
}

export function saveDraft(formId: string, content: string): void {
  try {
    localStorage.setItem(draftKey(formId), content);
  } catch {
    // Storage unavailable or quota exceeded: silently skip.
  }
}

export function clearDraft(formId: string): void {
  try {
    localStorage.removeItem(draftKey(formId));
  } catch {
    // Storage unavailable: nothing to clear.
  }
}
