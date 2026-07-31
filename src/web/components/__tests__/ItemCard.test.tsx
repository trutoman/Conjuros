import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemCard } from '../ItemCard';
import { createSpellItem, createTag, createWebLinkItem, denseTags } from './itemCard.fixtures';
import { getTopRowParts } from './itemCard.test-utils';

const spell = createSpellItem();

function mockNarrowTopRowLayout(width = 220) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.classList.contains('item-title-row')) {
      return {
        width,
        height: 24,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: 24,
        toJSON: () => ({}),
      } as DOMRect;
    }

    if (this.tagName.toLowerCase() === 'h2') {
      const titleWidth = 120;
      return {
        width: titleWidth,
        height: 24,
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: titleWidth,
        bottom: 24,
        toJSON: () => ({}),
      } as DOMRect;
    }

    return {
      width: 80,
      height: 24,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 80,
      bottom: 24,
      toJSON: () => ({}),
    } as DOMRect;
  });
}

afterEach(() => vi.restoreAllMocks());

describe('ItemCard', () => {
  it('places item content on the top row between title and tags', () => {
    const { container } = render(<ItemCard item={spell} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const { title, content, tags } = getTopRowParts(container);

    expect(content).toHaveTextContent('git status --short');
    expect(content.compareDocumentPosition(tags) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(title.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('retains aligned top-row/action structure for vertical centering styles', () => {
    const { container } = render(<ItemCard item={spell} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const header = container.querySelector('.item-header');
    const topRow = container.querySelector('.item-title-row');
    const actions = container.querySelector('.item-actions');

    expect(header).toBeTruthy();
    expect(topRow).toBeTruthy();
    expect(actions).toBeTruthy();
  });

  it('renders description accordion toggle inside the item inline content box', () => {
    const { container } = render(<ItemCard item={spell} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const inlineBox = container.querySelector('.item-inline-content-box');
    const toggle = screen.getByRole('button', { name: 'Show description' });

    expect(inlineBox).toBeTruthy();
    expect(inlineBox?.contains(toggle)).toBe(true);
  });

  it('copies the exact spell command and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<ItemCard item={spell} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByRole('img', { name: 'Spell' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy command' }));

    expect(writeText).toHaveBeenCalledWith('git status --short');
    expect(await screen.findByText('Command copied')).toBeInTheDocument();
  });

  it('renders tag colors and keeps secondary actions de-emphasized', () => {
    render(<ItemCard item={spell} tags={[createTag('git')]} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('git')).toHaveStyle({ color: '#123ABC' });
    expect(screen.getByRole('button', { name: 'Edit' })).toHaveClass('action-secondary');
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('action-secondary');
  });

  it('opens a link only when the open action is clicked', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <ItemCard
        item={createWebLinkItem({ url: 'https://example.com' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Copy command' })).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open link' }));
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('collapses overflowing tags into a +N indicator and reveals hidden tags on hover', async () => {
    mockNarrowTopRowLayout();
    render(
      <ItemCard
        item={createSpellItem({ tags: denseTags.map((tag) => tag.tagName) })}
        tags={denseTags}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const overflowButton = await screen.findByRole('button', { name: /show \d+ hidden tags/i });
    expect(overflowButton).toHaveTextContent(/^\+\d+$/);

    fireEvent.mouseEnter(overflowButton);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('automation');
  });

  it('reveals hidden tags on keyboard focus of +N indicator', async () => {
    mockNarrowTopRowLayout();
    render(
      <ItemCard
        item={createSpellItem({ tags: denseTags.map((tag) => tag.tagName) })}
        tags={denseTags}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const overflowButton = await screen.findByRole('button', { name: /show \d+ hidden tags/i });
    fireEvent.focus(overflowButton);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('infra');
  });

  it('does not reveal hidden tags on hover when touch-only media query disables hover', async () => {
    mockNarrowTopRowLayout();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

    render(
      <ItemCard
        item={createSpellItem({ tags: denseTags.map((tag) => tag.tagName) })}
        tags={denseTags}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const overflowButton = await screen.findByRole('button', { name: /show \d+ hidden tags/i });
    fireEvent.mouseEnter(overflowButton);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
