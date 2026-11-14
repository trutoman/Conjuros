import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ICON_ASSETS } from '../../lib/iconAssets';
import { CollectionPagination } from '../CollectionPagination';

function renderPagination(overrides: Partial<Parameters<typeof CollectionPagination>[0]> = {}) {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  const onLast = vi.fn();
  render(
    <CollectionPagination
      page={1}
      pageSize={27}
      total={60}
      onPrevious={onPrevious}
      onNext={onNext}
      onLast={onLast}
      {...overrides}
    />,
  );
  return { onPrevious, onNext, onLast };
}

function iconPath(button: HTMLElement) {
  return button.querySelector('path')?.getAttribute('d');
}

describe('CollectionPagination', () => {
  it('shows the displayed range and the matching total', () => {
    renderPagination({ page: 2 });

    expect(screen.getByText('Showing 28–54 of 60 items')).toBeInTheDocument();
  });

  it('shows a partial last page range', () => {
    renderPagination({ page: 3 });

    expect(screen.getByText('Showing 55–60 of 60 items')).toBeInTheDocument();
  });

  it('renders the theme navigation icons without visible text', () => {
    renderPagination({ page: 2 });

    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });
    const last = screen.getByRole('button', { name: 'Last page' });

    expect(previous).toHaveTextContent('');
    expect(next).toHaveTextContent('');
    expect(last).toHaveTextContent('');
    expect(iconPath(previous)).toBe(ICON_ASSETS['previous-page'].path);
    expect(iconPath(next)).toBe(ICON_ASSETS['next-page'].path);
    expect(iconPath(last)).toBe(ICON_ASSETS['last-page'].path);
  });

  it('disables the controls at both boundaries', () => {
    renderPagination({ page: 1 });
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeEnabled();

    renderPagination({ page: 3 });
    expect(screen.getAllByRole('button', { name: 'Previous page' })[1]).toBeEnabled();
    expect(screen.getAllByRole('button', { name: 'Next page' })[1]).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Last page' })[1]).toBeDisabled();
  });

  it('disables Previous and Last when a single page holds every item', () => {
    renderPagination({ total: 20 });

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('moves one page and jumps to the last page through native buttons', () => {
    const { onPrevious, onNext, onLast } = renderPagination({ page: 2 });

    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });
    const last = screen.getByRole('button', { name: 'Last page' });

    expect(previous.tagName).toBe('BUTTON');
    expect(next.tagName).toBe('BUTTON');
    expect(last.tagName).toBe('BUTTON');

    fireEvent.click(previous);
    fireEvent.click(next);
    fireEvent.click(last);

    expect(onPrevious).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onLast).toHaveBeenCalledTimes(1);
  });

  it('renders nothing while loading, on error, or without matches', () => {
    const noop = vi.fn();
    const { container: loading } = render(
      <CollectionPagination page={1} pageSize={27} total={60} onPrevious={noop} onNext={noop} onLast={noop} isLoading />,
    );
    expect(loading).toBeEmptyDOMElement();

    const { container: failed } = render(
      <CollectionPagination page={1} pageSize={27} total={60} onPrevious={noop} onNext={noop} onLast={noop} hasError />,
    );
    expect(failed).toBeEmptyDOMElement();

    const { container: empty } = render(
      <CollectionPagination page={1} pageSize={27} total={0} onPrevious={noop} onNext={noop} onLast={noop} />,
    );
    expect(empty).toBeEmptyDOMElement();
  });
});
