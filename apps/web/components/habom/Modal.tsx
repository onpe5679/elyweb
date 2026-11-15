'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
};

// Native <dialog> opened with showModal(): the rest of the page becomes inert, Escape closes it,
// and focus returns to whatever opened it. Mark the element that should receive focus with data-autofocus.
export default function Modal({ open, onClose, label, children, className = '' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      // showModal() focuses the first focusable element; content can name a better start point.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      document.documentElement.style.overflow = '';
      if (opener.current instanceof HTMLElement) opener.current.focus();
      onClose();
    };
    const handleCancel = (e: Event) => {
      e.preventDefault();
      dialog.close();
    };
    dialog.addEventListener('close', handleClose);
    dialog.addEventListener('cancel', handleCancel);
    return () => {
      dialog.removeEventListener('close', handleClose);
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [onClose]);

  useEffect(() => () => { document.documentElement.style.overflow = ''; }, []);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/80 backdrop:backdrop-blur-sm open:flex ${className}`}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {open && children}
    </dialog>
  );
}
