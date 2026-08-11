import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ItemCard } from '../ItemCard';
import { ThemeIconsContext, type ThemeIcons } from '../ThemeIconsContext';
import { ICON_ASSETS } from '../../lib/iconAssets';
import {
  createFileItem,
  createMarkdownItem,
  createSpellItem,
  createTag,
  createWebLinkItem,
  denseTags,
} from './itemCard.fixtures';
import { getTopRowParts } from './itemCard.test-utils';

const defaultIcons: ThemeIcons = { ...ICON_ASSETS } as ThemeIcons;

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
  onView = vi.fn(),
  isMenuOpen = false,
  onMenuToggle = vi.fn(),
}: {
  item?: CollectionItem;
  tags?: Tag[];
  onEdit?: (item: CollectionItem) => void;
  onDelete?: (item: CollectionItem) => void;
  onView?: (item: CollectionItem) => void;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
} = {}) {
  return render(
    <ItemCard
      item={item}
      tags={tags}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
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

  it('shows a View markdown action button on markdown cards only', () => {
    const onView = vi.fn();
    const md = createMarkdownItem();
    const { container } = renderItemCard({ item: md, onView });

    const actions = container.querySelector('.item-actions');
    expect(actions?.querySelectorAll('button')).toHaveLength(3);
    const viewButton = screen.getByRole('button', { name: 'View markdown' });
    expect(viewButton).toBeInTheDocument();
    expect(actions?.querySelector('.item-menu-wrapper')).not.toBeNull();

    fireEvent.click(viewButton);

    expect(onView).toHaveBeenCalledTimes(1);
    expect(onView).toHaveBeenCalledWith(md);

    expect(screen.queryByRole('button', { name: 'Copy command' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Open link' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Item menu' })).toBeInTheDocument();
  });

  it('never shows the View markdown button on spell or web-link cards', () => {
    renderItemCard({ item: spell });
    expect(screen.queryByRole('button', { name: 'View markdown' })).not.toBeInTheDocument();

    renderItemCard({ item: createWebLinkItem({ url: 'https://example.com' }) });
    expect(screen.queryByRole('button', { name: 'View markdown' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open link' })).toBeInTheDocument();
  });

  it('shows the Download markdown button on markdown cards between View and the menu trigger', () => {
    const { container } = renderItemCard({ item: createMarkdownItem() });

    const viewButton = screen.getByRole('button', { name: 'View markdown' });
    const downloadButton = screen.getByRole('button', { name: 'Download markdown' });
    const menuWrapper = container.querySelector('.item-menu-wrapper') as HTMLElement;

    expect(downloadButton).toBeInTheDocument();
    expect(
      viewButton.compareDocumentPosition(downloadButton) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      downloadButton.compareDocumentPosition(menuWrapper) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('never shows the Download markdown button on spell or web-link cards', () => {
    renderItemCard({ item: spell });
    expect(screen.queryByRole('button', { name: 'Download markdown' })).not.toBeInTheDocument();

    renderItemCard({ item: createWebLinkItem({ url: 'https://example.com' }) });
    expect(screen.queryByRole('button', { name: 'Download markdown' })).not.toBeInTheDocument();
  });

  it('downloads the markdown content with the item filename when Download is clicked', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const item = createMarkdownItem({ filename: 'notes.md' });
    renderItemCard({ item });
    const append = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node: Node) => node);

    fireEvent.click(screen.getByRole('button', { name: 'Download markdown' }));

    const anchor = append.mock.calls[0][0] as HTMLAnchorElement;
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(anchor.getAttribute('download')).toBe('notes.md');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('falls back to a title-based name for the download when the item has no filename', () => {
    const createObjectURL = vi.fn(() => 'blob:mock-url');
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderItemCard({ item: createMarkdownItem({ filename: null, title: 'My Ideas' }) });
    const append = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((node: Node) => node);

    fireEvent.click(screen.getByRole('button', { name: 'Download markdown' }));

    const anchor = append.mock.calls[0][0] as HTMLAnchorElement;
    expect(anchor.getAttribute('download')).toBe('my-ideas.md');
    expect(click).toHaveBeenCalledTimes(1);
  });

  describe('for a file item', () => {
    it('renders a file slug inline instead of the full content', () => {
      const { container } = renderItemCard({ item: createFileItem() });

      expect(screen.getByRole('img', { name: 'File' })).toBeInTheDocument();
      const { content } = getTopRowParts(container);
      expect(content).toHaveTextContent('Started at 09:00');
      expect(content).not.toHaveTextContent('Finished ok');
    });

    it('strips nothing from the file slug, keeping it plain text', () => {
      const { container } = renderItemCard({
        item: createFileItem({ content: 'Line one\n\nLine two' }),
      });

      const { content } = getTopRowParts(container);
      expect(content).toHaveTextContent('Line one');
      expect(content).not.toHaveTextContent('Line two');
    });

    it('shows the File icon and a Content slug, with no markdown-styled content', () => {
      const { container } = renderItemCard({ item: createFileItem() });
      const { content } = getTopRowParts(container);

      expect(screen.getByRole('img', { name: 'File' })).toBeInTheDocument();
      expect(content).not.toHaveTextContent('*');
      expect(content).not.toHaveTextContent('#');
    });

    it('shows a View file action button on file cards only', () => {
      const onView = vi.fn();
      const file = createFileItem();
      const { container } = renderItemCard({ item: file, onView });

      const actions = container.querySelector('.item-actions');
      expect(actions?.querySelectorAll('button')).toHaveLength(3);
      const viewButton = screen.getByRole('button', { name: 'View file' });
      expect(viewButton).toBeInTheDocument();

      fireEvent.click(viewButton);

      expect(onView).toHaveBeenCalledTimes(1);
      expect(onView).toHaveBeenCalledWith(file);

      expect(screen.queryByRole('button', { name: 'View markdown' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Copy command' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Open link' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Item menu' })).toBeInTheDocument();
    });

    it('never shows the View file button on spell, web-link, or markdown cards', () => {
      renderItemCard({ item: spell });
      expect(screen.queryByRole('button', { name: 'View file' })).not.toBeInTheDocument();

      renderItemCard({ item: createWebLinkItem({ url: 'https://example.com' }) });
      expect(screen.queryByRole('button', { name: 'View file' })).not.toBeInTheDocument();

      renderItemCard({ item: createMarkdownItem() });
      expect(screen.queryByRole('button', { name: 'View file' })).not.toBeInTheDocument();
    });

    it('shows the Download file button on file cards between View and the menu trigger', () => {
      const { container } = renderItemCard({ item: createFileItem() });

      const viewButton = screen.getByRole('button', { name: 'View file' });
      const downloadButton = screen.getByRole('button', { name: 'Download file' });
      const menuWrapper = container.querySelector('.item-menu-wrapper') as HTMLElement;

      expect(downloadButton).toBeInTheDocument();
      expect(
        viewButton.compareDocumentPosition(downloadButton) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        downloadButton.compareDocumentPosition(menuWrapper) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it('never shows the Download file button on spell, web-link, or markdown cards', () => {
      renderItemCard({ item: spell });
      expect(screen.queryByRole('button', { name: 'Download file' })).not.toBeInTheDocument();

      renderItemCard({ item: createWebLinkItem({ url: 'https://example.com' }) });
      expect(screen.queryByRole('button', { name: 'Download file' })).not.toBeInTheDocument();

      renderItemCard({ item: createMarkdownItem() });
      expect(screen.queryByRole('button', { name: 'Download file' })).not.toBeInTheDocument();
    });

    it('downloads the file content as a text/plain file when Download is clicked', () => {
      const createObjectURL = vi.fn(() => 'blob:mock-url');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      const item = createFileItem({ filename: 'system-status.txt' });
      renderItemCard({ item });
      const append = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => node);

      fireEvent.click(screen.getByRole('button', { name: 'Download file' }));

      const anchor = append.mock.calls[0][0] as HTMLAnchorElement;
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(anchor.getAttribute('download')).toBe('system-status.txt');
      expect(click).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('falls back to a title-based name for the download when the item has no filename', () => {
      const createObjectURL = vi.fn(() => 'blob:mock-url');
      vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL: vi.fn() });
      const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
      renderItemCard({ item: createFileItem({ filename: null, title: 'System Status' }) });
      const append = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node: Node) => node);

      fireEvent.click(screen.getByRole('button', { name: 'Download file' }));

      const anchor = append.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.getAttribute('download')).toBe('system-status');
      expect(click).toHaveBeenCalledTimes(1);
    });

    it('renders the file badge with the dedicated document outline glyph', () => {
      renderItemCard({ item: createFileItem() });

      const badge = screen.getByRole('img', { name: 'File' });
      expect(badge.getAttribute('viewBox')).toBe('0 0 24 24');
      expect(badge.querySelector('path')?.getAttribute('d')).toBe(
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6',
      );
    });

    it('renders the badge with the dedicated glyph, not the markdown glyph', () => {
      renderItemCard({ item: createFileItem() });

      const fileBadge = screen.getByRole('img', { name: 'File' });
      const filePath =
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6';
      const markdownPath =
        'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8';
      expect(fileBadge.querySelector('path')?.getAttribute('d')).toBe(filePath);
      expect(fileBadge.querySelector('path')?.getAttribute('d')).not.toBe(markdownPath);
    });

    it('uses the exact same icon path as View markdown for View file', () => {
      renderItemCard({ item: createMarkdownItem() });
      const markdownPath = screen
        .getByRole('button', { name: 'View markdown' })
        .querySelector('path')
        ?.getAttribute('d');
      renderItemCard({ item: createFileItem() });
      const filePath = screen
        .getByRole('button', { name: 'View file' })
        .querySelector('path')
        ?.getAttribute('d');

      expect(filePath).toBe(markdownPath);
      expect(filePath?.startsWith('M2 12s3-7')).toBe(true);
    });

    it('uses the exact same icon path as the markdown download for Download file', () => {
      renderItemCard({ item: createMarkdownItem() });
      const markdownPath = screen
        .getByRole('button', { name: 'Download markdown' })
        .querySelector('path')
        ?.getAttribute('d');
      renderItemCard({ item: createFileItem() });
      const filePath = screen
        .getByRole('button', { name: 'Download file' })
        .querySelector('path')
        ?.getAttribute('d');

      expect(filePath).toBe(markdownPath);
      expect(filePath?.startsWith('M21 15v4a2 2 0 0 1-2 2H5')).toBe(true);
    });
  });

  describe('outline icon style', () => {
    it('renders every icon with the outline .icon class and no filled variant', () => {
      const { container } = render(
        <ItemCard
          item={createFileItem()}
          tags={[]}
          onEdit={() => undefined}
          onDelete={() => undefined}
          isMenuOpen={false}
          onMenuToggle={() => undefined}
        />,
      );

      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
      icons.forEach((svg) => {
        expect(svg.classList.contains('icon')).toBe(true);
        expect(svg.classList.contains('icon-filled')).toBe(false);
        expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
      });
    });
  });

  describe('theme-driven icon rendering', () => {
    function renderWithIcons(ui: React.ReactNode, icons: ThemeIcons = defaultIcons) {
      return render(<ThemeIconsContext.Provider value={icons}>{ui}</ThemeIconsContext.Provider>);
    }

    it('renders the copy icon with the path provided by the theme context', () => {
      const customPath = 'M1 1 H10 V10 H1 Z';
      const { container } = renderWithIcons(
        <ItemCard
          item={createSpellItem()}
          tags={[]}
          onEdit={() => undefined}
          onDelete={() => undefined}
          isMenuOpen={false}
          onMenuToggle={() => undefined}
        />,
        {
          ...defaultIcons,
          copy: { path: customPath, viewBox: '0 0 12 12' },
        },
      );

      const copyIcon = container.querySelector('button[aria-label="Copy command"] svg');
      expect(copyIcon?.querySelector('path')?.getAttribute('d')).toBe(customPath);
      expect(copyIcon?.getAttribute('viewBox')).toBe('0 0 12 12');
    });

    it('falls back to the bundled icon when the theme omits a key', () => {
      const partial = { spell: defaultIcons.spell, view: defaultIcons.view } as ThemeIcons;
      const { container } = renderWithIcons(
        <ItemCard
          item={createSpellItem()}
          tags={[]}
          onEdit={() => undefined}
          onDelete={() => undefined}
          isMenuOpen={false}
          onMenuToggle={() => undefined}
        />,
        partial,
      );

      const copyIcon = container.querySelector('button[aria-label="Copy command"] svg');
      expect(copyIcon?.querySelector('path')?.getAttribute('d')).toBe(defaultIcons.copy.path);
    });
  });
});
