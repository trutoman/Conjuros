import { useRef, useState } from 'react';
import { ThemeIcon } from './ThemeIcon';

const SINGLE_FILE_MESSAGE = 'Drop a single file';
const READ_ERROR_MESSAGE = 'That file could not be read';

type DropZoneMode = 'file' | 'attachment';

function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('File could not be read as text'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('File could not be read'));
    reader.readAsText(file);
  });
}

export function DropZone({
  mode,
  onFile,
}: {
  mode: DropZoneMode;
  onFile: (fileName: string, content: string | null) => void;
}) {
  const isAttachment = mode === 'attachment';
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const readTokenRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function loadFile(file: File) {
    const token = readTokenRef.current + 1;
    readTokenRef.current = token;
    setError('');
    if (isAttachment) {
      onFile(file.name, null);
      setStatus(`Selected ${file.name}`);
      return;
    }
    setStatus(`Reading ${file.name}…`);
    try {
      const content = await readFileText(file);
      if (readTokenRef.current !== token) return;
      onFile(file.name, content);
      setStatus(`Loaded ${file.name}`);
    } catch {
      if (readTokenRef.current !== token) return;
      setStatus('');
      setError(READ_ERROR_MESSAGE);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (files.length !== 1) {
      setStatus('');
      setError(SINGLE_FILE_MESSAGE);
      return;
    }
    void loadFile(files[0]);
  }

  function isFileDrag(event: React.DragEvent<HTMLDivElement>) {
    return Array.from(event.dataTransfer.types ?? []).includes('Files');
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  function handlePickerChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    event.target.value = '';
    handleFiles(files);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    inputRef.current?.click();
  }

  return (
    <div
      className={`file-drop-zone${isAttachment ? ' attachment-drop-zone' : ''}${isDragging ? ' is-dragging' : ''}`}
      data-drop-zone={mode}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <button
        type="button"
        className="file-drop-zone-trigger"
        aria-label="Drop a file here or choose a file"
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleTriggerKeyDown}
      >
        <ThemeIcon
          name={isAttachment ? 'attachment' : 'file'}
          className={isAttachment ? 'file-drop-zone-icon attachment-icon' : 'file-drop-zone-icon'}
        />
        <span className="file-drop-zone-title">Drop a file here</span>
        <span className="file-drop-zone-hint">or click to choose one</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handlePickerChange}
      />
      <p className="file-drop-zone-status" role="status" aria-live="polite">
        {status}
      </p>
      {error && (
        <p className="file-drop-zone-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
