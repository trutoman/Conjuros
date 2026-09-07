import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../Sidebar';
import { ThemeIconsContext, type ThemeIcons } from '../ThemeIconsContext';
import { ICON_ASSETS } from '../../lib/iconAssets';
import type { Tag } from '@conjuros/contracts';
import type { CollectionFilters } from '../../hooks/useCollectionFilters';

const mockTags: Tag[] = [
  {
    id: 'tag-1',
    tagName: 'git',
    description: '',
    color: '#123ABC',
    tagCategory: 'Development',
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-2',
    tagName: 'docs',
    description: '',
    color: '#456DEF',
    tagCategory: 'Documentation',
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'tag-3',
    tagName: 'docker',
    description: '',
    color: '#789012',
    tagCategory: 'Development',
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const defaultFilters: CollectionFilters = {
  search: '',
  tags: [],
  tagFilterMode: 'all',
};

describe('Sidebar component', () => {
  it('renders categories in alphabetical order and tags alphabetically inside them', () => {
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const headers = screen.getAllByRole('heading', { level: 3 });
    expect(headers[0]).toHaveTextContent('development');
    expect(headers[1]).toHaveTextContent('documentation');

    const devTags = screen
      .getAllByRole('checkbox')
      .map((el) => el.closest('label')?.textContent?.trim());
    expect(devTags[0]).toBe('docker');
    expect(devTags[1]).toBe('git');
    expect(devTags[2]).toBe('docs');
  });

  it('merges categories that differ only by case into a single lowercase group', () => {
    const mixedCaseTags: Tag[] = [
      { ...mockTags[0], tagCategory: 'Development' },
      { ...mockTags[2], tagCategory: 'development' },
    ];
    render(
      <Sidebar
        tags={mixedCaseTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const headers = screen.getAllByRole('heading', { level: 3 });
    expect(headers).toHaveLength(1);
    expect(headers[0]).toHaveTextContent('development');
    expect(screen.getByText('git')).toBeInTheDocument();
    expect(screen.getByText('docker')).toBeInTheDocument();
  });

  it('renders tag names in lowercase even when stored mixed-case', () => {
    const mixedCaseTags: Tag[] = [{ ...mockTags[0], tagName: 'GIT' }];
    render(
      <Sidebar
        tags={mixedCaseTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('git')).toBeInTheDocument();
    expect(screen.getByText('git')).toBeInTheDocument();
  });

  it('triggers onChange callback when a tag checkbox is clicked', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={onChange}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('docker'));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tags: ['docker'],
    });
  });

  it('triggers onChange callback when a tag is deselected', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={{ ...defaultFilters, tags: ['docker'] }}
        onChange={onChange}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText('docker'));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tags: [],
    });
  });

  it('triggers onChange callback when match mode toggle is clicked', () => {
    const onChange = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={onChange}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Match any tag' }));
    expect(onChange).toHaveBeenCalledWith({
      ...defaultFilters,
      tagFilterMode: 'any',
    });
  });

  it('triggers onManageTags callback when manage tags is clicked', () => {
    const onManageTags = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onManageTags={onManageTags}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Manage tags' }));
    expect(onManageTags).toHaveBeenCalled();
  });

  it('triggers onClose callback when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close sidebar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders "Tags" toggle button with aria-expanded="true" when expanded', () => {
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        isOpen={true}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const toggleBtn = screen.getByRole('button', { name: 'Collapse tags sidebar' });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(toggleBtn).toHaveAttribute('aria-controls', 'tags-sidebar-panel');
  });

  it('hides inner content and renders aria-expanded="false" when reduced (isOpen=false)', () => {
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        isOpen={false}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const toggleBtn = screen.getByRole('button', { name: 'Expand tags sidebar' });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Manage tags' })).toBeNull();
  });

  describe('tags clear button', () => {
    function renderSidebar(filters: CollectionFilters = defaultFilters, onChange = vi.fn()) {
      render(
        <Sidebar
          tags={mockTags}
          filters={filters}
          onChange={onChange}
          onManageTags={vi.fn()}
          onClose={vi.fn()}
        />,
      );
      return onChange;
    }

    it('renders visible and disabled with the text "Clear" above the icon when no tag is selected', () => {
      renderSidebar();

      const clearBtn = screen.getByRole('button', { name: 'Clear tag selection' });
      expect(clearBtn).toBeVisible();
      expect(clearBtn).toBeDisabled();
      expect(clearBtn).toHaveAttribute('type', 'button');
      expect(clearBtn).toHaveTextContent('Clear');
      expect(clearBtn).toHaveClass('tags-toggle-btn');
      const label = clearBtn.querySelector('span');
      const icon = clearBtn.querySelector('svg.icon');
      expect(label).not.toBeNull();
      expect(icon).not.toBeNull();
      expect(label!.compareDocumentPosition(icon!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('renders the rescaled clear artwork on the shared 24-unit grid by default', () => {
      renderSidebar({ ...defaultFilters, tags: ['git'] });

      const clearBtn = screen.getByRole('button', { name: 'Clear tag selection' });
      const icon = clearBtn.querySelector('svg.icon');
      expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
      expect(icon?.querySelector('path')).toHaveAttribute('d', ICON_ASSETS.clear.path);
    });

    it('is enabled when one tag is selected', () => {
      renderSidebar({ ...defaultFilters, tags: ['git'] });

      expect(screen.getByRole('button', { name: 'Clear tag selection' })).toBeEnabled();
    });

    it('stays enabled when multiple tags are selected', () => {
      renderSidebar({ ...defaultFilters, tags: ['git', 'docker'] });

      expect(screen.getByRole('button', { name: 'Clear tag selection' })).toBeEnabled();
    });

    it('deselects every selected tag when activated', () => {
      const onChange = renderSidebar({ ...defaultFilters, tags: ['git', 'docker'] });

      fireEvent.click(screen.getByRole('button', { name: 'Clear tag selection' }));
      expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, tags: [] });
    });

    it('does not fire onChange when activated while disabled', () => {
      const onChange = renderSidebar();

      fireEvent.click(screen.getByRole('button', { name: 'Clear tag selection' }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('is a native keyboard-operable button', () => {
      renderSidebar({ ...defaultFilters, tags: ['git'] });

      const clearBtn = screen.getByRole('button', { name: 'Clear tag selection' });
      expect(clearBtn.tagName).toBe('BUTTON');
      clearBtn.focus();
      expect(clearBtn).toHaveFocus();
    });

    it('sits between the Tags toggle and the Match selector in the same header row', () => {
      renderSidebar();

      const headerRight = document.querySelector('.sidebar-header-right');
      expect(headerRight).not.toBeNull();
      const clearBtn = screen.getByRole('button', { name: 'Clear tag selection' });
      expect(headerRight!.firstElementChild).toBe(clearBtn);
      expect(headerRight!.querySelector('[aria-label="Tag match mode"]')).not.toBeNull();
      expect(clearBtn.compareDocumentPosition(headerRight!.querySelector('[aria-label="Tag match mode"]')!)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
      expect(clearBtn.closest('.sidebar-header')).not.toBeNull();
    });

    it('is hidden along with the other header controls when collapsed', () => {
      render(
        <Sidebar
          tags={mockTags}
          filters={defaultFilters}
          isOpen={false}
          onChange={vi.fn()}
          onManageTags={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(screen.queryByRole('button', { name: 'Clear tag selection' })).toBeNull();
    });

    it('renders the clear icon from the active theme record and follows theme changes', () => {
      const first: ThemeIcons = {
        ...ICON_ASSETS,
        clear: { path: 'FIRST_CLEAR_PATH', viewBox: '0 0 24 24' },
      };
      const { rerender } = render(
        <ThemeIconsContext.Provider value={first}>
          <Sidebar
            tags={mockTags}
            filters={{ ...defaultFilters, tags: ['git'] }}
            onChange={vi.fn()}
            onManageTags={vi.fn()}
            onClose={vi.fn()}
          />
        </ThemeIconsContext.Provider>,
      );

      const clearBtn = screen.getByRole('button', { name: 'Clear tag selection' });
      expect(clearBtn.querySelector('svg.icon path')).toHaveAttribute('d', 'FIRST_CLEAR_PATH');

      rerender(
        <ThemeIconsContext.Provider
          value={{ ...first, clear: { path: 'SECOND_CLEAR_PATH', viewBox: '0 0 24 24' } }}
        >
          <Sidebar
            tags={mockTags}
            filters={{ ...defaultFilters, tags: ['git'] }}
            onChange={vi.fn()}
            onManageTags={vi.fn()}
            onClose={vi.fn()}
          />
        </ThemeIconsContext.Provider>,
      );
      expect(
        screen.getByRole('button', { name: 'Clear tag selection' }).querySelector('svg.icon path'),
      ).toHaveAttribute('d', 'SECOND_CLEAR_PATH');
    });
  });

  it('triggers onToggleOpen when Escape key is pressed while expanded', () => {
    const onToggleOpen = vi.fn();
    render(
      <Sidebar
        tags={mockTags}
        filters={defaultFilters}
        isOpen={true}
        onToggleOpen={onToggleOpen}
        onChange={vi.fn()}
        onManageTags={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onToggleOpen).toHaveBeenCalled();
  });
});
