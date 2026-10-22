import { DropZone } from './DropZone';

export function FileDropZone({
  onFileLoaded,
}: {
  onFileLoaded: (fileName: string, content: string) => void;
}) {
  return (
    <DropZone
      mode="file"
      onFile={(fileName, content) => onFileLoaded(fileName, content ?? '')}
    />
  );
}
