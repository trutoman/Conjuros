import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TagInput, TagUpdate } from '@conjuros/contracts';
import { createTag, deleteTag, listTags, reorderTag, updateTag } from '../services/tags';

export function useTags() {
  const client = useQueryClient();
  const invalidate = () => {
    void client.invalidateQueries({ queryKey: ['tags'] });
    void client.invalidateQueries({ queryKey: ['collection'] });
  };

  const result = useQuery({
    queryKey: ['tags'],
    queryFn: () => listTags({ limit: 50, skip: 0, sort: 'order' }),
  });

  const createMutation = useMutation({ mutationFn: createTag, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, tag }: { id: string; tag: TagUpdate }) => updateTag(id, tag),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteTag, onSuccess: invalidate });
  const reorderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) => reorderTag(id, order),
    onSuccess: invalidate,
  });

  return {
    tags: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error : null,
    create: (tag: TagInput) => createMutation.mutateAsync(tag),
    update: ({ id, tag }: { id: string; tag: TagUpdate }) => updateMutation.mutateAsync({ id, tag }),
    remove: (id: string) => deleteMutation.mutateAsync(id),
    reorder: ({ id, order }: { id: string; order: number }) => reorderMutation.mutateAsync({ id, order }),
  };
}
