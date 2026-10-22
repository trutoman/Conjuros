import { DropZone } from './DropZone';

export function AttachmentDropZone({
  onFileSelected,
}: {
  onFileSelected: (file: File) => void;
}) {
  return <DropZone mode="attachment" onFile={(_fileName, _content, file) => onFileSelected(file)} />;
}
