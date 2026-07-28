import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CollectionItemUpdate, CollectionQuery } from '@conjuros/contracts';
import { createItem, deleteItem, listItems, reorderItem, updateItem } from '../services/items';

export function useCollection(query: CollectionQuery) {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['collection'] });
  const result = useQuery({ queryKey: ['collection', query], queryFn: () => listItems(query) });
  const createMutation = useMutation({ mutationFn: createItem, onSuccess: invalidate });
  const updateMutation = useMutation({ mutationFn: ({ id, item }: { id: string; item: CollectionItemUpdate }) => updateItem(id, item), onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: deleteItem, onSuccess: invalidate });
  const reorderMutation = useMutation({ mutationFn: ({ id, order }: { id: string; order: number }) => reorderItem(id, order), onSuccess: invalidate });
  return {
    items: result.data?.items ?? [], total: result.data?.total ?? 0, isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error : null,
    create: createMutation.mutateAsync, update: updateMutation.mutateAsync, remove: deleteMutation.mutateAsync, reorder: ({ id, order }: { id: string; order: number }) => reorderMutation.mutateAsync({ id, order }),
  };
}