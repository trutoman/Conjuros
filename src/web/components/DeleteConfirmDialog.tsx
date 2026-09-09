import { Modal } from './Modal';

export function DeleteConfirmDialog({
  title,
  onConfirm,
  onCancel,
  error,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string;
}) {
  return (
    <Modal label={`Delete ${title}?`} onClose={onCancel}>
      <div className="confirm-dialog">
        <h2>Delete {title}?</h2>
        <p>This action cannot be undone.</p>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        <div>
          <button className="danger" onClick={onConfirm}>
            Delete item
          </button>
          <button className="quiet" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
