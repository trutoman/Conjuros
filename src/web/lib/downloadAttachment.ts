import { getAttachmentDownload } from '../services/items';

export async function downloadAttachment(itemId: string): Promise<void> {
  const { url } = await getAttachmentDownload(itemId);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
