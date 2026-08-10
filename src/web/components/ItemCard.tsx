import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { computeTagOverflow, estimateInlineWidth } from './itemCardOverflow';
import { markdownSlug, plainTextSlug } from '../lib/itemCardSlug';
import { downloadMarkdownFile } from '../lib/downloadMarkdown';
import { downloadTextFile } from '../lib/downloadFile';
import { ThemeIcon } from './ThemeIcon';

export function ItemCard({
  item,
  tags = [],
  onEdit,
  onDelete,
  onView,
  isMenuOpen,
  onMenuToggle,
}: {
  item: CollectionItem;
  tags?: Tag[];
  onEdit: (item: CollectionItem) => void;
  onDelete: (item: CollectionItem) => void;
  onView?: (item: CollectionItem) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [topRowWidth, setTopRowWidth] = useState<number>(Number.POSITIVE_INFINITY);
  const [isTagOverflowOpen, setIsTagOverflowOpen] = useState(false);
  const topRowRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [menuView, setMenuView] = useState<'menu' | 'confirm'>('menu');
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tagColors = new Map(tags.map((tag) => [tag.tagName, tag.color]));
  const isSpell = item.kind === 'spell';
  const contentValue = item.command ?? item.url ?? item.content ?? '';
  const inlineContent =
    item.kind === 'markdown'
      ? markdownSlug(item.content ?? '')
      : item.kind === 'file'
        ? plainTextSlug(item.content ?? '')
        : contentValue;
  const kindLabel = isSpell ? 'Spell' : item.kind === 'web-link' ? 'Web link' : item.kind === 'file' ? 'File' : 'Markdown';

  const supportsHover = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true;
    }
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  useEffect(() => {
    const node = topRowRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      const width = node.getBoundingClientRect().width;
      setTopRowWidth(width > 0 ? width : Number.POSITIVE_INFINITY);
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        const next = entry.contentRect.width;
        setTopRowWidth(next > 0 ? next : Number.POSITIVE_INFINITY);
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { visibleTags, hiddenTags } = useMemo(() => {
    if (item.tags.length === 0) {
      return { visibleTags: [] as string[], hiddenTags: [] as string[] };
    }

    const titleWidth =
      titleRef.current?.getBoundingClientRect().width ?? estimateInlineWidth(item.title, 8, 20);
    const tagWidths = item.tags.map((tag) => estimateInlineWidth(tag, 7, 18));
    const overflow = computeTagOverflow({
      availableWidth: topRowWidth,
      titleWidth,
      minContentWidth: 32,
      tagWidths,
      gap: 6,
    });

    if (overflow.collapsedCount <= 0) {
      return { visibleTags: item.tags, hiddenTags: [] as string[] };
    }

    return {
      visibleTags: item.tags.slice(0, overflow.visibleCount),
      hiddenTags: item.tags.slice(overflow.visibleCount),
    };
  }, [item.tags, item.title, topRowWidth]);

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied`);
    } catch {
      setMessage(`Could not copy ${label.toLowerCase()}`);
    }
  }

  const openUrl = item.kind === 'web-link' ? (item.url ?? undefined) : undefined;

  function closeMenu() {
    onMenuToggle();
  }

  function handleEdit() {
    onEdit(item);
    closeMenu();
  }

  function handleDeleteStart() {
    setMenuView('confirm');
  }

  function handleDeleteConfirm() {
    onDelete(item);
    closeMenu();
  }

  function handleMenuKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      triggerRef.current?.focus();
      return;
    }
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (e.key === 'Tab') {
      closeMenu();
    }
  }

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const isInsideMenu = Boolean(menuRef.current?.contains(target));
      const isOnTrigger = Boolean(triggerRef.current?.contains(target));
      if (!isInsideMenu && !isOnTrigger) {
        onMenuToggle();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isMenuOpen, onMenuToggle]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();
  }, [isMenuOpen, menuView]);

  useEffect(() => {
    if (isMenuOpen) {
      setMenuView('menu');
    }
  }, [isMenuOpen]);

  return (
    <article
      className={`item-card kind-${item.kind}${isMenuOpen ? ' item-card--menu-open' : ''}`}
    >
      <div className="item-header">
        <div className="item-title-group">
          <div
            className={`item-type-badge kind-${item.kind}`}
            aria-label={kindLabel}
          >
            {item.kind === 'spell' ? (
              <ThemeIcon
                label="Spell"
                title="Spell"
                name="spell"
              />
            ) : item.kind === 'web-link' ? (
              <ThemeIcon
                label="Web link"
                title="Web link"
                name="web-link"
              />
            ) : item.kind === 'file' ? (
              <ThemeIcon
                label="File"
                title="File"
                name="file"
              />
            ) : (
              <ThemeIcon
                label="Markdown"
                title="Markdown"
                name="markdown"
              />
            )}
          </div>
          <div className="item-title-block">
            <div className="item-title-row" ref={topRowRef}>
              <h2 ref={titleRef}>{item.title}</h2>
              <div className="item-inline-content-box">
                <code className="item-inline-content" aria-label="Item content">
                  {inlineContent}
                </code>
                {item.description && (
                  <button
                    type="button"
                    className="icon-action accordion-toggle item-inline-toggle"
                    aria-label={expanded ? 'Hide description' : 'Show description'}
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    <ThemeIcon
                      label={expanded ? 'Collapse' : 'Expand'}
                      title={expanded ? 'Collapse' : 'Expand'}
                      name={expanded ? 'collapse' : 'expand'}
                    />
                  </button>
                )}
              </div>
              {item.tags.length > 0 && (
                <div className="tags" aria-label="Item tags">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-pill"
                      style={
                        tagColors.has(tag)
                          ? { color: tagColors.get(tag), borderColor: tagColors.get(tag) }
                          : undefined
                      }
                    >
                      {tag.toLowerCase()}
                    </span>
                  ))}
                  {hiddenTags.length > 0 && (
                    <div className="tag-overflow">
                      <button
                        type="button"
                        className="tag-overflow-indicator"
                        aria-label={`Show ${hiddenTags.length} hidden tags`}
                        onMouseEnter={() => {
                          if (supportsHover) {
                            setIsTagOverflowOpen(true);
                          }
                        }}
                        onMouseLeave={() => {
                          if (supportsHover) {
                            setIsTagOverflowOpen(false);
                          }
                        }}
                        onFocus={() => setIsTagOverflowOpen(true)}
                        onBlur={() => setIsTagOverflowOpen(false)}
                      >
                        +{hiddenTags.length}
                      </button>
                      {isTagOverflowOpen && (
                        <div className="tag-overflow-popover" role="tooltip">
                          {hiddenTags.map((hiddenTag) => hiddenTag.toLowerCase()).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="item-actions" aria-label="Item actions">
          {isSpell && (
            <button
              type="button"
              className="icon-action"
              aria-label="Copy command"
              onClick={() => copy(item.command ?? '', 'Command')}
            >
              <ThemeIcon
                label="Copy"
                title="Copy"
                name="copy"
              />
            </button>
          )}
          {item.kind === 'web-link' && openUrl && (
            <button
              type="button"
              className="icon-action"
              aria-label="Open link"
              onClick={() => window.open(openUrl, '_blank', 'noopener,noreferrer')}
            >
              <ThemeIcon
                label="Open"
                title="Open"
                name="open"
              />
            </button>
          )}
          {item.kind === 'markdown' && (
            <button
              type="button"
              className="icon-action"
              aria-label="View markdown"
              onClick={() => onView?.(item)}
            >
              <ThemeIcon
                label="View"
                title="View"
                name="view"
              />
            </button>
          )}
          {item.kind === 'markdown' && (
            <button
              type="button"
              className="icon-action"
              aria-label="Download markdown"
              onClick={() => downloadMarkdownFile(item)}
            >
              <ThemeIcon
                label="Download"
                title="Download"
                name="download"
              />
            </button>
          )}
          {item.kind === 'file' && (
            <button
              type="button"
              className="icon-action"
              aria-label="View file"
              onClick={() => onView?.(item)}
            >
              <ThemeIcon
                label="View"
                title="View"
                name="view"
              />
            </button>
          )}
          {item.kind === 'file' && (
            <button
              type="button"
              className="icon-action"
              aria-label="Download file"
              onClick={() => downloadTextFile(item)}
            >
              <ThemeIcon
                label="Download"
                title="Download"
                name="download"
              />
            </button>
          )}
          <div className="item-menu-wrapper">
            <button
              type="button"
              className="icon-action"
              aria-label="Item menu"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              aria-controls={`item-menu-${item.id}`}
              ref={triggerRef}
              onClick={onMenuToggle}
            >
              <ThemeIcon
                label="Menu"
                title="Menu"
                name="menu"
              />
            </button>
            {isMenuOpen && menuView === 'menu' && (
              <div
                className="item-menu-dropdown"
                id={`item-menu-${item.id}`}
                role="menu"
                aria-label="Item options"
                ref={menuRef}
                onKeyDown={handleMenuKeyDown}
              >
                <button
                  type="button"
                  className="icon-action"
                  role="menuitem"
                  aria-label="Edit"
                  tabIndex={-1}
                  onClick={handleEdit}
                >
                  <ThemeIcon
                    label="Edit"
                    title="Edit"
                    name="edit"
                  />
                </button>
                <button
                  type="button"
                  className="icon-action danger"
                  role="menuitem"
                  aria-label="Delete"
                  tabIndex={-1}
                  onClick={handleDeleteStart}
                >
                  <ThemeIcon
                    label="Delete"
                    title="Delete"
                    name="delete"
                  />
                </button>
              </div>
            )}
            {isMenuOpen && menuView === 'confirm' && (
              <div
                className="item-menu-dropdown item-menu-dropdown--confirm"
                id={`item-menu-${item.id}`}
                role="menu"
                aria-label="Confirm delete"
                ref={menuRef}
                onKeyDown={handleMenuKeyDown}
              >
                <button
                  type="button"
                  className="icon-action danger"
                  role="menuitem"
                  aria-label="Confirm delete"
                  tabIndex={-1}
                  onClick={handleDeleteConfirm}
                >
                  <ThemeIcon
                    label="Confirm"
                    title="Confirm"
                    name="confirm"
                  />
                </button>
                <button
                  type="button"
                  className="icon-action"
                  role="menuitem"
                  aria-label="Cancel delete"
                  tabIndex={-1}
                  onClick={() => {
                    onMenuToggle();
                    triggerRef.current?.focus();
                  }}
                >
                  <ThemeIcon
                    label="Cancel"
                    title="Cancel"
                    name="cancel"
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {item.description && expanded && <p className="item-description">{item.description}</p>}
      {message && (
        <p className="action-message" role="status">
          {message}
        </p>
      )}
    </article>
  );
}
