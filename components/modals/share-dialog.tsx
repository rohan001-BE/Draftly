'use client';

import { useState } from 'react';
import { Share2, X } from 'lucide-react';
import { Share } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserAvatar } from '@/components/common/user-avatar';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share?: Share;
  onShare?: (email: string, permission: 'viewer' | 'editor') => Promise<void> | void;
  onRevoke?: (userId: string) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  share,
  onShare,
  onRevoke,
  isSubmitting = false,
}: ShareDialogProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'viewer' | 'editor'>('viewer');

  const handleShare = async () => {
    if (email.trim() && onShare) {
      await onShare(email.trim(), permission);
      setEmail('');
      setPermission('viewer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem] border border-border/20 bg-card/95 p-6 shadow-2xl backdrop-blur-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Share2 className="h-5 w-5" />
            </div>
            Share Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Share Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share with collaborator</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="rounded-xl flex-1 bg-muted/50 border-border/10 focus:border-primary/50 text-sm h-11"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleShare();
                  }
                }}
              />
              <Select value={permission} onValueChange={(v: any) => setPermission(v)}>
                <SelectTrigger className="w-28 rounded-xl border-border/10 bg-muted/50 h-11 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="viewer" className="text-xs rounded-lg">Viewer</SelectItem>
                  <SelectItem value="editor" className="text-xs rounded-lg">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => void handleShare()}
            className="w-full rounded-xl h-11 font-semibold bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow shadow-primary/10 hover:opacity-95"
            disabled={!email.trim() || isSubmitting}
          >
            {isSubmitting ? 'Sharing...' : 'Share Document'}
          </Button>

          {/* Shared Users List */}
          {share && share.sharedWith && share.sharedWith.length > 0 ? (
            <div className="space-y-3 pt-4 border-t border-border/20">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collaborators ({share.sharedWith.length})</p>
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {share.sharedWith.map((sw) => (
                  <div
                    key={sw.userId}
                    className="flex items-center justify-between rounded-2xl bg-muted/40 border border-border/10 p-3 transition hover:bg-muted/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={sw.user} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{sw.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{sw.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[0.65rem] uppercase tracking-wider py-0.5 px-2 font-semibold bg-background border border-border/10 text-muted-foreground">
                        {sw.permission}
                      </Badge>
                      {onRevoke && (
                        <button
                          onClick={() => void onRevoke(sw.userId)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                          title="Revoke access"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : share ? (
            <div className="text-center py-4 border-t border-border/20 text-xs text-muted-foreground">
              Not shared with anyone yet
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
