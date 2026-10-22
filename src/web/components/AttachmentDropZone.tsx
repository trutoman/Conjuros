import { DropZone } from './DropZone';

export function AttachmentDropZone({
  onFileSelected,
}: {
  onFileSelected: (fileName: string) => void;
}) {
  return <DropZone mode="attachment" onFile={(fileName) => onFileSelected(fileName)} />;
}
