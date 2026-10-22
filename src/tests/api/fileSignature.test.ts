// @vitest-environment node
import { attachmentMimeTypes } from '@conjuros/contracts';
import { describe, expect, it } from 'vitest';
import { detectFileFamily, fileMatchesMimeType } from '../../api/storage/fileSignature';

const bytes = (...values: number[]) => Buffer.from(values);
const padded = (head: Buffer, length = 600) =>
  Buffer.concat([head, Buffer.alloc(Math.max(0, length - head.length), 1)]);

const samples = {
  jpeg: padded(bytes(0xff, 0xd8, 0xff, 0xe0)),
  png: padded(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)),
  gif: padded(Buffer.from('GIF89a')),
  webp: padded(Buffer.concat([Buffer.from('RIFF'), bytes(1, 2, 3, 4), Buffer.from('WEBP')])),
  pdf: padded(Buffer.from('%PDF-1.7')),
  ole: padded(bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1)),
  zip: padded(bytes(0x50, 0x4b, 0x03, 0x04)),
  sevenZ: padded(bytes(0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c)),
  gzip: padded(bytes(0x1f, 0x8b, 0x08)),
  tar: (() => {
    const buffer = Buffer.alloc(512, 0x20);
    Buffer.from('ustar').copy(buffer, 257);
    return buffer;
  })(),
  text: Buffer.from('name,value\nñandú,1\n'),
};

describe('file signatures', () => {
  it.each([
    ['image/jpeg', samples.jpeg],
    ['image/png', samples.png],
    ['image/gif', samples.gif],
    ['image/webp', samples.webp],
    ['application/pdf', samples.pdf],
    ['application/msword', samples.ole],
    ['application/vnd.ms-excel', samples.ole],
    ['application/vnd.ms-powerpoint', samples.ole],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', samples.zip],
    ['application/zip', samples.zip],
    ['application/x-7z-compressed', samples.sevenZ],
    ['application/gzip', samples.gzip],
    ['application/x-tar', samples.tar],
    ['text/plain', samples.text],
    ['text/csv', samples.text],
  ] as const)('accepts a real file for %s', (mimeType, buffer) => {
    expect(fileMatchesMimeType(buffer, mimeType)).toBe(true);
  });

  it('rejects content that does not match the declared type', () => {
    expect(fileMatchesMimeType(samples.zip, 'application/pdf')).toBe(false);
    expect(fileMatchesMimeType(samples.png, 'image/jpeg')).toBe(false);
    expect(fileMatchesMimeType(bytes(0x4d, 0x5a, 0x90, 0x00, 0x03), 'application/pdf')).toBe(false);
    expect(fileMatchesMimeType(samples.pdf, 'text/plain')).toBe(false);
  });

  it('rejects empty files and binary data declared as text', () => {
    expect(detectFileFamily(Buffer.alloc(0))).toBeNull();
    expect(fileMatchesMimeType(Buffer.alloc(0), 'text/plain')).toBe(false);
    expect(fileMatchesMimeType(bytes(0x00, 0x01, 0x02, 0xfe, 0xff), 'text/plain')).toBe(false);
  });

  it('covers every allowed MIME type', () => {
    for (const mimeType of attachmentMimeTypes) {
      expect(typeof fileMatchesMimeType(Buffer.from('x'), mimeType)).toBe('boolean');
    }
  });
});
