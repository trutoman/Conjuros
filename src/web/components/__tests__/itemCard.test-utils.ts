import { within } from '@testing-library/react';

export function getTopRow(container: HTMLElement) {
  const topRow = container.querySelector('.item-title-row');
  if (!topRow) {
    throw new Error('Top row not found');
  }
  return topRow as HTMLElement;
}

export function getTopRowParts(container: HTMLElement) {
  const topRow = getTopRow(container);
  const title = within(topRow).getByRole('heading', { level: 2 });
  const content = topRow.querySelector('.item-inline-content');
  const tags = topRow.querySelector('.tags');

  if (!content || !tags) {
    throw new Error('Top row content or tags not found');
  }

  return { topRow, title, content: content as HTMLElement, tags: tags as HTMLElement };
}
