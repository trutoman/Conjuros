import { useState } from 'react';
import type { Tag, TagInput, ThemePreference } from '@conjuros/contracts';
import { DeleteConfirmDialog } from '../components/DeleteConfirmDialog';
import { TagForm } from '../components/TagForm';
import { TagList } from '../components/TagList';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserWidget } from '../components/UserWidget';
import { useTags } from '../hooks/useTags';

export function TagsPage({
    onBack,
    theme = 'light',
    onThemeChange,
    onSignOut,
    user,
}: {
    onBack: () => void;
    theme?: ThemePreference;
    onThemeChange?: (theme: ThemePreference) => void | Promise<void>;
    onSignOut?: () => void;
    user?: { email: string };
}) {
    const tagsState = useTags();
    const [formTag, setFormTag] = useState<Tag | null | undefined>(undefined);
    const [deleteTag, setDeleteTag] = useState<Tag | null>(null);
    const [actionError, setActionError] = useState('');

    async function saveTag(input: TagInput) {
        try {
            if (formTag) await tagsState.update({ id: formTag.id, tag: input });
            else await tagsState.create(input);
            setFormTag(undefined);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : 'Could not save tag');
        }
    }

    async function confirmTagDelete() {
        if (!deleteTag) return;
        try {
            await tagsState.remove(deleteTag.id);
            setDeleteTag(null);
        } catch (cause) {
            setActionError(cause instanceof Error ? cause.message : 'Could not delete tag');
        }
    }

    return (
        <main className="app-shell">
            <header className="topbar">
                <div className="topbar-brand">
                    <p className="eyebrow">Enchantments to charm machines.</p>
                    <h1>Conjuros</h1>
                </div>
                <div className="topbar-right">
                    {user && onSignOut && <UserWidget email={user.email} onSignOut={onSignOut} />}
                    <div className="topbar-actions">
                        <button onClick={onBack}>← Collection</button>
                        <button onClick={() => setFormTag(null)}>Add tag</button>
                        <ThemeToggle theme={theme} onChange={(nextTheme) => onThemeChange?.(nextTheme)} />
                    </div>
                </div>
            </header>
            {actionError && <p className="field-error">{actionError}</p>}
            <TagList
                tags={tagsState.tags}
                onEdit={setFormTag}
                onDelete={setDeleteTag}
                onMove={(id, order) =>
                    void tagsState
                        .reorder({ id, order })
                        .catch((cause: unknown) =>
                            setActionError(cause instanceof Error ? cause.message : 'Could not reorder tag'),
                        )
                }
            />
            {formTag !== undefined && (
                <TagForm
                    tag={formTag ?? undefined}
                    onSubmit={saveTag}
                    onCancel={() => setFormTag(undefined)}
                />
            )}
            {deleteTag && (
                <DeleteConfirmDialog
                    title={deleteTag.tagName}
                    onConfirm={() => void confirmTagDelete()}
                    onCancel={() => setDeleteTag(null)}
                />
            )}
        </main>
    );
}
