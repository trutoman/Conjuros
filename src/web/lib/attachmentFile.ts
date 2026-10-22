import {
  attachmentExtensions,
  isAttachmentMimeType,
  type AttachmentMimeType,
} from '@conjuros/contracts';

const mimeByExtension = new Map<string, AttachmentMimeType>([
  ...(Object.entries(attachmentExtensions) as [AttachmentMimeType, string][]).map(
    ([mimeType, extension]) => [extension, mimeType] as [string, AttachmentMimeType],
  ),
  ['jpeg', 'image/jpeg'],
  ['tgz', 'application/gzip'],
]);

function extensionOf(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

// Browsers often report an empty or generic type (for example CSV as an Excel type), so the
// extension decides when the reported type is missing, unsupported, or a known mislabel.
export function resolveAttachmentFile(file: File): File | null {
  const extension = extensionOf(file.name);
  const byExtension = mimeByExtension.get(extension) ?? null;
  const reportedIsUsable =
    isAttachmentMimeType(file.type) && !(extension === 'csv' && file.type !== 'text/csv');
  const mimeType = reportedIsUsable ? file.type : byExtension;
  if (!mimeType) return null;
  return file.type === mimeType ? file : new File([file], file.name, { type: mimeType });
}
