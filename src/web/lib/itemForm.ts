import { z } from 'zod';

export const MESSAGES = {
  titleRequired: 'Title is required',
  commandRequired: 'Command is required for a spell',
  contentRequired: 'Content is required for a markdown note',
  filenameRequired: 'Filename is required for a markdown note',
  filenameInvalid: 'Filename must be a name of at most 64 characters ending in .md, with no path separators',
  fileContentRequired: 'Content is required for a file',
  fileFilenameRequired: 'Filename is required for a file',
  fileFilenameInvalid: 'Filename must be a name of at most 128 characters with no path separators',
  invalidUrl: 'URL must use the http or https protocol',
  generic: 'Check the item details',
} as const;

function isEmptyOrWhitespace(value: unknown): value is string {
  return typeof value === 'string' && value.trim() === '';
}

function isValidFilename(value: string): boolean {
  const trimmed = value.trim();
  return trimmed !== '' && trimmed.length <= 64 && !/[\\/]/.test(trimmed) && /\.md$/i.test(trimmed);
}

function isValidFileFilename(value: string): boolean {
  const trimmed = value.trim();
  return trimmed !== '' && trimmed.length <= 128 && !/[\\/]/.test(trimmed);
}

type ParseResult =
  | { success: true }
  | { success: false; error: z.ZodError };

export function messageForInputError(
  payload: { kind?: string; title?: unknown; command?: unknown; url?: unknown; content?: unknown; filename?: unknown },
  result: ParseResult,
  isCreate = true,
): string | null {
  if (isEmptyOrWhitespace(payload.title)) return MESSAGES.titleRequired;

  if (payload.kind === 'spell') {
    if (isEmptyOrWhitespace(payload.command)) return MESSAGES.commandRequired;
    return result.success ? null : MESSAGES.generic;
  }

  if (payload.kind === 'web-link') {
    if (isEmptyOrWhitespace(payload.url)) return MESSAGES.invalidUrl;
    if (!result.success) {
      const urlIssue = result.error.issues.find((issue) => issue.path[0] === 'url');
      if (urlIssue) return MESSAGES.invalidUrl;
    }
    return result.success ? null : MESSAGES.generic;
  }

  if (payload.kind === 'markdown') {
    if (isEmptyOrWhitespace(payload.content)) return MESSAGES.contentRequired;
    if (isCreate && isEmptyOrWhitespace(payload.filename)) return MESSAGES.filenameRequired;
    if (typeof payload.filename === 'string' && payload.filename.trim() !== '' && !isValidFilename(payload.filename)) {
      return MESSAGES.filenameInvalid;
    }
    return result.success ? null : MESSAGES.generic;
  }

  if (payload.kind === 'file') {
    if (isEmptyOrWhitespace(payload.content)) return MESSAGES.fileContentRequired;
    if (isCreate && isEmptyOrWhitespace(payload.filename)) return MESSAGES.fileFilenameRequired;
    if (typeof payload.filename === 'string' && payload.filename.trim() !== '' && !isValidFileFilename(payload.filename)) {
      return MESSAGES.fileFilenameInvalid;
    }
    return result.success ? null : MESSAGES.generic;
  }

  return result.success ? null : MESSAGES.generic;
}
