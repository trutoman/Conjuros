import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TagCategoryInput, TagCategoryUpdate } from '@conjuros/contracts';
import {
  createTagCategory,
  deleteTagCategory,
  listTagCategories,
  reorderTagCategory,
  updateTagCategory,
} from '../services/tag-categories';

export function useTagCategories() {
  const client = useQueryClient();
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['tag-categories'] });
    void client.invalidateQueries({ queryKey: ['tags'] });
  };

  const result = useQuery({
    queryKey: ['tag-categories'],
    queryFn: () => listTagCategories({ limit: 50, skip: 0, sort: 'order' }),
  });

  const createMutation = useMutation({ mutationFn: createTagCategory, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: TagCategoryUpdate }) =>
      updateTagCategory(id, category),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteTagCategory, onSuccess: invalidate });
  const reorderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) => reorderTagCategory(id, order),
    onSuccess: invalidate,
  });

  return {
    categories: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error : null,
    create: (input: TagCategoryInput) => createMutation.mutateAsync(input),
    update: ({ id, category }: { id: string; category: TagCategoryUpdate }) =>
      updateMutation.mutateAsync({ id, category }),
    remove: (id: string) => deleteMutation.mutateAsync(id),
    reorder: ({ id, order }: { id: string; order: number }) => reorderMutation.mutateAsync({ id, order }),
  };
}
