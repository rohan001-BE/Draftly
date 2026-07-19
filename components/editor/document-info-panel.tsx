'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Info } from 'lucide-react';
import { Document, Share } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/user-avatar';

interface DocumentInfoPanelProps {
  document: Document;
  share?: Share;
}

export function DocumentInfoPanel({ document, share }: DocumentInfoPanelProps) {
  const formattedCreated = document.createdAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedUpdated = document.updatedAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 cursor-pointer rounded-xl border-slate-200/80 bg-white/80 shadow-sm hover:border-blue-200 hover:bg-blue-50"
          title="Document Info"
        >
          <Info className="h-4 w-4 text-blue-600" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[95vw] overflow-y-auto bg-white/95 backdrop-blur-lg border-l border-border/10 shadow-[0_24px_120px_-48px_rgba(15,23,42,0.35)] sm:w-96">
        <SheetHeader className="pb-4 border-b border-border/10">
          <SheetTitle className="text-xl font-bold">Document Info</SheetTitle>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">View owner details, activity, and sharing status for this document.</p>
        </SheetHeader>

        <div className="space-y-6 mt-6 px-4 pb-6">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border border-border/20 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Owner</p>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-gradient-to-br from-primary to-secondary p-1 shadow-inner">
                <UserAvatar user={document.owner} size="md" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{document.owner.name}</p>
                <p className="text-xs text-muted-foreground truncate">{document.owner.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-50/80 border border-border/20 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Created</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formattedCreated}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Updated</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formattedUpdated}</p>
              </div>
            </div>
            <div className="rounded-3xl bg-white/90 p-3 border border-border/10">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Last modified by</p>
              <p className="text-sm font-medium text-foreground">{document.lastModifiedBy}</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-slate-50/80 border border-border/20 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Sharing</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{share && share.sharedWith.length ? `${share.sharedWith.length} collaborators` : 'Private'}</p>
              </div>
              <Badge variant={share && share.sharedWith.length ? 'outline' : 'secondary'} className="text-xs uppercase tracking-[0.25em] py-1 px-2">
                {share && share.sharedWith.length ? 'Shared' : 'Only me'}
              </Badge>
            </div>

            {share && share.sharedWith.length > 0 ? (
              <div className="space-y-3">
                {share.sharedWith.map((sharedUser) => (
                  <div
                    key={sharedUser.userId}
                    className="flex items-center justify-between gap-3 rounded-3xl bg-white/95 p-3 border border-border/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={sharedUser.user} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{sharedUser.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{sharedUser.user.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-[0.25em] py-1 px-2">
                      {sharedUser.permission}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">This document is not shared with anyone yet.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
