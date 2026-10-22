import type { AttachmentMimeType } from '@conjuros/contracts';

type Family =
  | 'jpeg'
  | 'png'
  | 'gif'
  | 'webp'
  | 'pdf'
  | 'ole'
  | 'zip'
  | '7z'
  | 'gzip'
  | 'tar'
  | 'text';

const acceptedFamilies: Record<AttachmentMimeType, Family[]> = {
  'image/jpeg': ['jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'application/pdf': ['pdf'],
  'application/msword': ['ole'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['zip'],
  'application/vnd.ms-excel': ['ole'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['zip'],
  'application/vnd.ms-powerpoint': ['ole'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['zip'],
  'text/plain': ['text'],
  'text/csv': ['text'],
  'application/zip': ['zip'],
  'application/x-7z-compressed': ['7z'],
  'application/gzip': ['gzip'],
  'application/x-tar': ['tar'],
};

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  if (buffer.length < offset + bytes.length) return false;
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function isUtf8Text(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, 8192);
  if (sample.includes(0)) return false;
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample);
    return true;
  } catch {
    // A multi-byte character cut by the sample boundary is not a binary signal.
    if (buffer.length <= sample.length) return false;
    try {
      new TextDecoder('utf-8', { fatal: true }).decode(sample.subarray(0, sample.length - 3));
      return true;
    } catch {
      return false;
    }
  }
}

export function detectFileFamily(buffer: Buffer): Family | null {
  if (buffer.length === 0) return null;
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return 'jpeg';
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
    return 'gif';
  }
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
    return 'webp';
  }
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46, 0x2d])) return 'pdf';
  if (startsWith(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'ole';
  if (startsWith(buffer, [0x50, 0x4b, 0x03, 0x04])) return 'zip';
  if (startsWith(buffer, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) return '7z';
  if (startsWith(buffer, [0x1f, 0x8b])) return 'gzip';
  if (startsWith(buffer, [0x75, 0x73, 0x74, 0x61, 0x72], 257)) return 'tar';
  if (isUtf8Text(buffer)) return 'text';
  return null;
}

export function fileMatchesMimeType(buffer: Buffer, mimeType: AttachmentMimeType): boolean {
  const family = detectFileFamily(buffer);
  return family !== null && acceptedFamilies[mimeType].includes(family);
}
