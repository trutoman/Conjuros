import { useEffect, useMemo, useRef, useState } from 'react';
import type { CollectionItem, Tag } from '@conjuros/contracts';
import { computeTagOverflow, estimateInlineWidth } from './itemCardOverflow';

function Icon({
  label,
  path,
  title,
  viewBox = '0 0 24 24',
  filled = false,
}: {
  label: string;
  path: string;
  title: string;
  viewBox?: string;
  filled?: boolean;
}) {
  return (
    <svg
      className={filled ? 'icon icon-filled' : 'icon'}
      role="img"
      aria-label={label}
      viewBox={viewBox}
      focusable="false"
      aria-hidden={false}
    >
      <title>{title}</title>
      <path d={path} />
    </svg>
  );
}

export function ItemCard({
  item,
  tags = [],
  onEdit,
  onDelete,
}: {
  item: CollectionItem;
  tags?: Tag[];
  onEdit: (item: CollectionItem) => void;
  onDelete: (item: CollectionItem) => void;
}) {
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [topRowWidth, setTopRowWidth] = useState<number>(Number.POSITIVE_INFINITY);
  const [isTagOverflowOpen, setIsTagOverflowOpen] = useState(false);
  const topRowRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const tagColors = new Map(tags.map((tag) => [tag.tagName, tag.color]));
  const isSpell = item.kind === 'spell';
  const contentValue = item.command ?? item.url ?? '';

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

  return (
    <article className={`item-card kind-${item.kind}`}>
      <div className="item-header">
        <div className="item-title-group">
          <div
            className={`item-type-badge kind-${item.kind}`}
            aria-label={isSpell ? 'Spell' : 'Web link'}
          >
            {isSpell ? (
              <Icon
                label="Spell"
                title="Spell"
                path="m176-120-56-56 301-302-181-45 198-123-17-234 179 151 216-88-87 217 151 178-234-16-124 198-45-181-301 301Zm24-520-80-80 80-80 80 80-80 80Zm355 197 48-79 93 7-60-71 35-86-86 35-71-59 7 92-79 49 90 22 23 90Zm165 323-80-80 80-80 80 80-80 80ZM569-570Z"
                viewBox="0 -960 960 960"
                filled
              />
            ) : (
              <Icon
                label="Web link"
                title="Web link"
                path="M320-160q-33 0-56.5-23.5T240-240v-120h120v-90q-35-2-66.5-15.5T236-506v-44h-46L60-680q36-46 89-65t107-19q27 0 52.5 4t51.5 15v-55h480v520q0 50-35 85t-85 35H320Zm120-200h240v80q0 17 11.5 28.5T720-240q17 0 28.5-11.5T760-280v-440H440v24l240 240v56h-56L510-514l-8 8q-14 14-29.5 25T440-464v104ZM224-630h92v86q12 8 25 11t27 3q23 0 41.5-7t36.5-25l8-8-56-56q-29-29-65-43.5T256-684q-20 0-38 3t-36 9l42 42Zm376 350H320v40h286q-3-9-4.5-19t-1.5-21Zm-280 40v-40 40Z"
                viewBox="0 -960 960 960"
                filled
              />
            )}
          </div>
          <div className="item-title-block">
            <div className="item-title-row" ref={topRowRef}>
              <h2 ref={titleRef}>{item.title}</h2>
              <div className="item-inline-content-box">
                <code className="item-inline-content" aria-label="Item content">
                  {contentValue}
                </code>
                {item.description && (
                  <button
                    type="button"
                    className="icon-action accordion-toggle item-inline-toggle"
                    aria-label={expanded ? 'Hide description' : 'Show description'}
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                  >
                    <Icon
                      label={expanded ? 'Collapse' : 'Expand'}
                      title={expanded ? 'Collapse' : 'Expand'}
                      path={expanded ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'}
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
                      {tag}
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
                          {hiddenTags.join(', ')}
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
              <Icon
                label="Copy"
                title="Copy"
                path="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"
                viewBox="0 -960 960 960"
                filled
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
              <Icon
                label="Open"
                title="Open"
                path="M318-120q-82 0-140-58t-58-140q0-40 15-76t43-64l134-133 56 56-134 134q-17 17-25.5 38.5T200-318q0 49 34.5 83.5T318-200q23 0 45-8.5t39-25.5l133-134 57 57-134 133q-28 28-64 43t-76 15Zm79-220-57-57 223-223 57 57-223 223Zm251-28-56-57 134-133q17-17 25-38t8-44q0-50-34-85t-84-35q-23 0-44.5 8.5T558-726L425-592l-57-56 134-134q28-28 64-43t76-15q82 0 139.5 58T839-641q0 39-14.5 75T782-502L648-368Z"
                viewBox="0 -960 960 960"
                filled
              />
            </button>
          )}
          <button
            type="button"
            className="icon-action action-secondary"
            aria-label="Edit"
            onClick={() => onEdit(item)}
          >
            <Icon
              label="Edit"
              title="Edit"
              path="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
            />
          </button>
          <button
            type="button"
            className="icon-action action-secondary danger"
            aria-label="Delete"
            onClick={() => onDelete(item)}
          >
            <Icon
              label="Delete"
              title="Delete"
              path="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"
              viewBox="0 -960 960 960"
              filled
            />
          </button>
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
