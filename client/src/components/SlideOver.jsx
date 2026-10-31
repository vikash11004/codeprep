import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
export default function SlideOver({ isOpen, onClose, title, children }) {
  return <Dialog.Root open={isOpen} onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog-panel" aria-describedby={undefined}><div className="dialog-header"><Dialog.Title>{title}</Dialog.Title><Dialog.Close className="icon-button" aria-label="Close dialog"><X size={19} /></Dialog.Close></div><div className="dialog-body">{children}</div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
