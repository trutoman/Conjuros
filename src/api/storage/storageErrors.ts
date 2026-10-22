import { AppError } from '../errors';

interface SupabaseStorageError {
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
}

function failureMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const { message } = error as SupabaseStorageError;
    if (typeof message === 'string') return message;
  }
  return '';
}

// Supabase Storage answers with its own error messages and status codes. The API only has
// AppError codes, so map the known rejections onto them and keep the rest as a transient
// outage: an unknown Storage failure is never the client's fault.
export function toStorageError(error: unknown): AppError {
  const message = failureMessage(error);

  if (/mime type .* is not supported|invalid mime type/i.test(message)) {
    return new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'File storage does not accept this file type');
  }

  if (/maximum allowed size|entity too large|payload too large/i.test(message)) {
    return new AppError(413, 'FILE_TOO_LARGE', 'The file exceeds the maximum size allowed by storage');
  }

  if (/bucket not found/i.test(message)) {
    return new AppError(503, 'STORAGE_NOT_CONFIGURED', 'File storage is not configured on this server');
  }

  if (/object not found/i.test(message)) {
    return new AppError(404, 'NOT_FOUND', 'The stored file is missing');
  }

  return new AppError(503, 'STORAGE_UNAVAILABLE', 'File storage is unavailable, please try again');
}
