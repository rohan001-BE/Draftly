'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SUPPORTED_FILE_TYPES, COMING_SOON_FILE_TYPES } from '@/lib/constants';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload?: (file: File) => void;
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (SUPPORTED_FILE_TYPES.includes(ext)) {
      onUpload?.(file);
      onOpenChange(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            Import Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept={SUPPORTED_FILE_TYPES.join(',')}
            className="hidden"
          />

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/5 shadow-md shadow-primary/5 scale-[1.01]'
                : 'border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40'
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground transition-transform group-hover:scale-105" />
            <p className="text-sm font-bold text-foreground mb-1">Drag and drop your file here</p>
            <p className="text-xs text-muted-foreground">or click to browse local files</p>
          </div>

          {/* Supported Formats */}
          <div className="space-y-3 pt-3 border-t border-border/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-1.5">Supported formats:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORTED_FILE_TYPES.map((type) => (
                  <span key={type} className="px-2.5 py-1 bg-primary/5 border border-primary/15 text-primary text-[11px] font-semibold rounded-lg">
                    {type.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            {COMING_SOON_FILE_TYPES.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5">Coming soon:</p>
                <div className="flex flex-wrap gap-1.5">
                  {COMING_SOON_FILE_TYPES.map((type) => (
                    <span key={type} className="px-2.5 py-1 bg-muted/40 border border-border/20 text-muted-foreground/60 text-[11px] font-medium rounded-lg opacity-60">
                      {type.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleBrowseClick}
            className="w-full rounded-xl h-11 font-semibold bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow shadow-primary/10 hover:opacity-95 cursor-pointer"
          >
            Browse Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
