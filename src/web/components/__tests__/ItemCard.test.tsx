import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemCard } from '../ItemCard';
import { createMarkdownItem, createSpellItem, createTag, createWebLinkItem, denseTags } from './itemCard.fixtures';
import { getTopRowParts } from './itemCard.test-utils';

const spell = createSpellItem();

function ControlledItemCard({
  item = spell,
  onEdit = vi.fn(),
  onDelete = vi.fn(),
}: {
  item?: CollectionItem;
  onEdit?: (item: CollectionItem) => void;
  onDelete?: (item: CollectionItem) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <ItemCard
      item={item}
      onEdit={onEdit}
      onDelete={onDelete}
      isMenuOpen={isMenuOpen}
      onMenuToggle={() => setIsMenuOpen((v) => !v)}
    />
  );
}

function renderItemCard({
  item = spell,
  tags,
  onEdit = vi.fn(),
  onDelete = vi.fn(),
  isMenuOpen = false,
  onMenuToggle = vi.fn(),
}: {
  item?: CollectionItem;
  tags?: Tag[];
  onEdit?: (item: CollectionItem) => void;
  onDelete?: (item: CollectionItem) => void;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
} = {}) {
  return render(
    <ItemCard
      item={item}
      tags={tags}
      onEdit={onEdit}
      onDelete={onDelete}
      isMenuOpen={isMenuOpen}
      onMenuToggle={onMenuToggle}
    />,
  );
}

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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ItemCard', () => {
  it('places item content on the top row between title and tags', () => {
    const { container } = renderItemCard();
    const { title, content, tags } = getTopRowParts(container);

    expect(content).toHaveTextContent('git status --short');
    expect(content.compareDocumentPosition(tags) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(title.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('retains aligned top-row/action structure for vertical centering styles', () => {
    const { container } = renderItemCard();

    const header = container.querySelector('.item-header');
    const topRow = container.querySelector('.item-title-row');
    const actions = container.querySelector('.item-actions');

    expect(header).toBeTruthy();
    expect(topRow).toBeTruthy();
    expect(actions).toBeTruthy();
  });

  it('renders description accordion toggle inside the item inline content box', () => {
    const { container } = renderItemCard();

    const inlineBox = container.querySelector('.item-inline-content-box');
    const toggle = screen.getByRole('button', { name: 'Show description' });

    expect(inlineBox).toBeTruthy();
    expect(inlineBox?.contains(toggle)).toBe(true);
  });

  it('copies the exact spell command and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    renderItemCard();

    expect(screen.getByRole('img', { name: 'Spell' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Copy command' }));

    expect(writeText).toHaveBeenCalledWith('git status --short');
    expect(await screen.findByText('Command copied')).toBeInTheDocument();
  });

  it('renders tag colors and shows only two buttons in item-actions for a spell', () => {
    const { container } = renderItemCard({ tags: [createTag('git')] });

    expect(screen.getByText('git')).toHaveStyle({ color: '#123ABC' });
    const actions = container.querySelector('.item-actions');
    expect(actions?.querySelectorAll('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Copy command' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item menu' })).toBeInTheDocument();
  });

  it('renders item tags in lowercase even when stored mixed-case', () => {
    renderItemCard({
      item: createSpellItem({ tags: ['GIT'] }),
      tags: [createTag('GIT')],
    });

    expect(screen.getByText('git')).toBeInTheDocument();
    expect(screen.queryByText('GIT')).not.toBeInTheDocument();
  });

  it('shows only two buttons in item-actions for a web-link', () => {
    const { container } = renderItemCard({ item: createWebLinkItem({ url: 'https://example.com' }) });
    const actions = container.querySelector('.item-actions');
    expect(actions?.querySelectorAll('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Open link' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Item menu' })).toBeInTheDocument();
  });

  it('opens the contextual menu when the trigger is clicked', () => {
    render(<ControlledItemCard />);
    const trigger = screen.getByRole('button', { name: 'Item menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
  });

  it('calls onMenuToggle when the open menu trigger is clicked again', () => {
    const onMenuToggle = vi.fn();
    renderItemCard({ isMenuOpen: true, onMenuToggle });

    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));

    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });

  it('does not close the menu when a pointer press lands on the trigger', () => {
    const onMenuToggle = vi.fn();
    renderItemCard({ isMenuOpen: true, onMenuToggle });

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Item menu' }));

    expect(onMenuToggle).not.toHaveBeenCalled();
  });

  it('closes the open menu when the same trigger is clicked again', () => {
    render(<ControlledItemCard />);
    const trigger = screen.getByRole('button', { name: 'Item menu' });

    fireEvent.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('adds the menu-open class to the card article when the menu is opened', () => {
    const { container } = render(<ControlledItemCard />);
    const card = container.querySelector('.item-card');
    expect(card).not.toHaveClass('item-card--menu-open');

    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));

    expect(card).toHaveClass('item-card--menu-open');
  });

  it('removes the menu-open class from the card article when the menu closes on Escape', () => {
    const { container } = render(<ControlledItemCard />);
    const card = container.querySelector('.item-card');
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    expect(card).toHaveClass('item-card--menu-open');

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

    expect(card).not.toHaveClass('item-card--menu-open');
  });

  it('removes the menu-open class from the card article when the menu closes on outside click', () => {
    const { container } = render(<ControlledItemCard />);
    const card = container.querySelector('.item-card');
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    expect(card).toHaveClass('item-card--menu-open');

    fireEvent.pointerDown(document.body);

    expect(card).not.toHaveClass('item-card--menu-open');
  });

  it('closes the menu when clicking outside', () => {
    render(<ControlledItemCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes the menu on Escape key', () => {
    render(<ControlledItemCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('calls onEdit and closes the menu when Edit is clicked', () => {
    const onEdit = vi.fn();
    render(<ControlledItemCard onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(spell);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows inline confirmation when Delete is clicked', () => {
    render(<ControlledItemCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Confirm delete' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Cancel delete' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('calls onDelete and closes the menu when Confirm is clicked', () => {
    const onDelete = vi.fn();
    render(<ControlledItemCard onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Confirm delete' }));

    expect(onDelete).toHaveBeenCalledWith(spell);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('does not call onDelete when Cancel is clicked', () => {
    const onDelete = vi.fn();
    render(<ControlledItemCard onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Cancel delete' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('moves focus with ArrowDown and ArrowUp between menu items', () => {
    render(<ControlledItemCard />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    const menu = screen.getByRole('menu');
    const [editItem, deleteItem] = screen.getAllByRole('menuitem');

    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(deleteItem);
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(editItem);
  });

  it('returns focus to the trigger when Escape is pressed', () => {
    render(<ControlledItemCard />);
    const trigger = screen.getByRole('button', { name: 'Item menu' });
    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');

    fireEvent.keyDown(menu, { key: 'Escape' });

    expect(document.activeElement).toBe(trigger);
  });

  it('opens a link only when the open action is clicked', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    renderItemCard({ item: createWebLinkItem({ url: 'https://example.com' }) });

    expect(screen.queryByRole('button', { name: 'Copy command' })).not.toBeInTheDocument();
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Open link' }));
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('collapses overflowing tags into a +N indicator and reveals hidden tags on hover', async () => {
    mockNarrowTopRowLayout();
    renderItemCard({
      item: createSpellItem({ tags: denseTags.map((tag) => tag.tagName) }),
      tags: denseTags,
    });

    const overflowButton = await screen.findByRole('button', { name: /show \d+ hidden tags/i });
    expect(overflowButton).toHaveTextContent(/^\+\d+$/);

    fireEvent.mouseEnter(overflowButton);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('automation');
  });

  it('reveals hidden tags on keyboard focus of +N indicator', async () => {
    mockNarrowTopRowLayout();
    renderItemCard({
      item: createSpellItem({ tags: denseTags.map((tag) => tag.tagName) }),
      tags: denseTags,
    });

    const overflowButton = await screen.findByRole('button', { name: /show \d+ hidden tags/i });
    fireEvent.focus(overflowButton);

    expect(await screen.findByRole('tooltip')).toHaveTextContent('infra');
  });

  it('does not reveal hidden tags on hover when touch-only media query disables hover', async () => {
    mockNarrowTopRowLayout();
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

    renderItemCard({
      item: createSpellItem({ tags: denseTags.map((tag) => tag.tagName) }),
      tags: denseTags,
    });

    const overflowButton = await screen.findByRole('button', { name: /show \d+ hidden tags/i });
    fireEvent.mouseEnter(overflowButton);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders the markdown slug inline instead of the full content', () => {
    const { container } = renderItemCard({ item: createMarkdownItem() });

    expect(screen.getByRole('img', { name: 'Markdown' })).toBeInTheDocument();
    const { content } = getTopRowParts(container);
    expect(content).toHaveTextContent('Heading');
    expect(content).not.toHaveTextContent('Some **bold** text.');
    expect(content).not.toHaveTextContent('Second line stays hidden.');
  });

  it('strips markdown markers from the markdown inline slug', () => {
    const { container } = renderItemCard({
      item: createMarkdownItem({ content: '- **Task one**\n\n- Task two' }),
    });

    const { content } = getTopRowParts(container);
    expect(content).toHaveTextContent('Task one');
    expect(content).not.toHaveTextContent('**');
  });

  it('keeps the full markdown content available for editing', () => {
    const item = createMarkdownItem();
    const onEdit = vi.fn();
    render(<ControlledItemCard item={item} onEdit={onEdit} />);
    fireEvent.click(screen.getByRole('button', { name: 'Item menu' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledWith(item);
    expect(onEdit.mock.calls[0][0].content).toBe(item.content);
  });

  it('shows only the menu button in item-actions for a markdown item', () => {
    const { container } = renderItemCard({ item: createMarkdownItem() });

    const actions = container.querySelector('.item-actions');
    expect(actions?.querySelectorAll('button')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Item menu' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy command' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open link' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy content' })).not.toBeInTheDocument();
  });
});
