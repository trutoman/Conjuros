import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ThemeInput, ThemeUpdate } from '@conjuros/contracts';
import {
  activateTheme,
  createTheme,
  deleteTheme,
  listThemes,
  updateTheme,
} from '../services/themes';

export function useThemes() {
  const client = useQueryClient();
  const invalidate = () => client.invalidateQueries({ queryKey: ['themes'] });

  const result = useQuery({
    queryKey: ['themes'],
    queryFn: () => listThemes({ limit: 50, skip: 0, sort: 'name' }),
  });

  const createMutation = useMutation({ mutationFn: createTheme, onSuccess: invalidate });
  const updateMutation = useMutation({
    mutationFn: ({ id, theme }: { id: string; theme: ThemeUpdate }) => updateTheme(id, theme),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({ mutationFn: deleteTheme, onSuccess: invalidate });
  const activateMutation = useMutation({ mutationFn: activateTheme, onSuccess: invalidate });

  return {
    themes: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error : null,
    create: (theme: ThemeInput) => createMutation.mutateAsync(theme),
    update: ({ id, theme }: { id: string; theme: ThemeUpdate }) => updateMutation.mutateAsync({ id, theme }),
    remove: (id: string) => deleteMutation.mutateAsync(id),
    activate: (id: string) => activateMutation.mutateAsync(id),
  };
}