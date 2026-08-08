const BLOCK_MARKERS = [
  /^#{1,6}\s+/, // ATX headings
  /^>\s*/, // blockquotes
  /^[-*+]\s+/, // unordered list items
  /^\d+[.)]\s+/, // ordered list items
];

const INLINE_MARKERS: RegExp[] = [
  /\[([^\]]*)\]\([^)]*\)/g, // links -> keep label
  /`([^`]*)`/g, // inline code -> keep content
  /\*\*([^*]+)\*\*/g, // bold -> keep content
  /__([^_]+)__/g, // bold alt -> keep content
  /[*_]([^*_]+)[*_]/g, // emphasis -> keep content
  /~~([^~]+)~~/g, // strikethrough -> keep content
];

function keepInner(_match: string, inner: string): string {
  return inner ?? '';
}

function stripImages(value: string): string {
  return value.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
}

export function markdownSlug(content: string): string {
  const firstNonEmptyLine = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (firstNonEmptyLine === undefined) return '';

  let slug = firstNonEmptyLine;
  let changed = true;
  while (changed) {
    changed = false;
    let next = slug;
    next = stripImages(next);
    for (const marker of BLOCK_MARKERS) {
      const stripped = next.replace(marker, '');
      if (stripped !== next) {
        next = stripped;
        changed = true;
      }
    }
    for (const marker of INLINE_MARKERS) {
      next = next.replace(marker, keepInner);
    }
    if (next !== slug) {
      slug = next;
      changed = true;
    }
  }
  return slug.replace(/\s+/g, ' ').trim();
}
