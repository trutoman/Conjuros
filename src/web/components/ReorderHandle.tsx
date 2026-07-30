import downArrowIcon from '../assets/icons/down-arrow.svg';
import upArrowIcon from '../assets/icons/up-arrow.svg';

export function ReorderHandle({
  title,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  title: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div className="reorder-controls" aria-label={`Reorder ${title}`}>
      <span aria-hidden="true" className="drag-mark">
        ⋮
      </span>
      <button
        type="button"
        aria-label={`Move ${title} up`}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        <img src={upArrowIcon} alt="" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Move ${title} down`}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        <img src={downArrowIcon} alt="" aria-hidden="true" />
      </button>
    </div>
  );
}
