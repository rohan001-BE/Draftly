'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SheetProps {
  children: React.ReactNode;
}

interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right';
}

interface SheetHeaderProps {
  children: React.ReactNode;
}

interface SheetTitleProps {
  children: React.ReactNode;
}

const SheetContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function Sheet({ children }: SheetProps) {
  const [open, setOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild }: SheetTriggerProps) {
  const context = React.useContext(SheetContext);
  
  if (!context) {
    return null;
  }

  return asChild
    ? React.cloneElement(children as React.ReactElement, {
        onClick: () => context.setOpen(true),
      })
    : <div onClick={() => context.setOpen(true)}>{children}</div>;
}

export function SheetContent({ children, className = '', side = 'right' }: SheetContentProps) {
  const context = React.useContext(SheetContext);
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.createElement('div');
    root.setAttribute('data-sheet-portal', '');
    document.body.appendChild(root);
    setPortalElement(root);

    return () => {
      document.body.removeChild(root);
    };
  }, []);

  if (!context || !context.open || !portalElement) {
    return null;
  }

  const sideClasses = side === 'left'
    ? 'left-0 top-0 bottom-0 border-r border-border/20 animate-in slide-in-from-left duration-200'
    : 'right-0 top-0 bottom-0 border-l border-border/20 animate-in slide-in-from-right duration-200';

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[10000] bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => context.setOpen(false)}
      />
      <div
        className={`fixed z-[10001] w-full max-w-[95vw] sm:w-80 bg-background shadow-2xl overflow-y-auto ${sideClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={() => context.setOpen(false)}
            className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </>,
    portalElement,
  );
}

export function SheetHeader({ children }: SheetHeaderProps) {
  return <div className="p-6 pb-4 border-b border-border">{children}</div>;
}

export function SheetTitle({ children }: SheetTitleProps) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
