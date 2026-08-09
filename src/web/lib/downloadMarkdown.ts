export function suggestedMarkdownFileName(item: {
  filename?: string | null;
  title: string;
}): string {
  if (item.filename) {
    return item.filename;
  }
  const slug = item.title.toLowerCase().trim().replace(/\s+/g, '-');
  return `${slug || 'note'}.md`;
}

export function downloadMarkdownFile(
  item: { content?: string | null } & Parameters<typeof suggestedMarkdownFileName>[0],
): void {
  const blob = new Blob([item.content ?? ''], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = suggestedMarkdownFileName(item);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
