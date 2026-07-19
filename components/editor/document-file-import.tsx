'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  fileToTiptapJson,
  getFileExtension,
  IMPORTABLE_FILE_EXTENSIONS,
  isImportableFile,
} from '@/lib/editor/file-import';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { DocumentJsonContent } from '@/types/document';

interface DocumentFileImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (content: DocumentJsonContent, fileName: string) => void;
}

export function DocumentFileImport({ open, onOpenChange, onImport }: DocumentFileImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    if (!isImportableFile(file)) {
      showErrorToast(`Unsupported file type "${getFileExtension(file.name) || 'unknown'}". Use .txt or .md only.`);
      return;
    }

    try {
      const content = await fileToTiptapJson(file);
      onImport(content, file.name);
      showSuccessToast(`Imported ${file.name}`);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to import file';
      showErrorToast(message);
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (file) {
      void processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      void processFile(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import File
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept={IMPORTABLE_FILE_EXTENSIONS.join(',')}
            className="hidden"
            onChange={handleFileSelection}
          />

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-border bg-secondary/20'
            }`}
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Drag and drop a .txt or .md file here</p>
            <p className="mt-1 text-xs text-muted-foreground">Files are read locally and never uploaded to storage</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Supported formats:</p>
            <div className="flex gap-2">
              {IMPORTABLE_FILE_EXTENSIONS.map((type) => (
                <span key={type} className="rounded bg-secondary/50 px-2 py-1 text-xs">
                  {type}
                </span>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={() => inputRef.current?.click()}>
            Browse Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
