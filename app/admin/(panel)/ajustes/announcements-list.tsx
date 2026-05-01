'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  deleteAnnouncementAction,
  toggleAnnouncementAction,
} from '@/server/actions/announcements';

import { AnnouncementForm } from './announcement-form';

type Item = {
  id: string;
  message: string;
  isActive: boolean;
  updatedAt: Date;
};

type Props = {
  items: Item[];
};

const FORMATTER = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function AnnouncementsList({ items }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const onToggle = (item: Item) => {
    setPendingId(item.id);
    const formData = new FormData();
    formData.set('id', item.id);
    formData.set('activate', item.isActive ? 'false' : 'true');
    startTransition(async () => {
      await toggleAnnouncementAction(undefined, formData);
      setPendingId(null);
    });
  };

  const onDelete = (item: Item) => {
    if (!confirm('¿Borrar este anuncio? No se puede deshacer.')) return;
    setPendingId(item.id);
    const formData = new FormData();
    formData.set('id', item.id);
    startTransition(async () => {
      await deleteAnnouncementAction(undefined, formData);
      setPendingId(null);
    });
  };

  return (
    <ul className="mt-3 divide-y divide-border">
      {items.map((item) => {
        const isEditing = editingId === item.id;
        const isPending = pendingId === item.id;
        return (
          <li key={item.id} className="py-3">
            {isEditing ? (
              <AnnouncementForm
                mode={{
                  kind: 'edit',
                  id: item.id,
                  message: item.message,
                  isActive: item.isActive,
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'font-sans text-[14px] leading-snug',
                      item.isActive ? 'font-medium text-fg' : 'text-fg-muted',
                    )}
                  >
                    {item.message}
                  </p>
                  <p className="mt-1 font-sans text-[11px] text-fg-subtle">
                    {item.isActive ? 'Activo · ' : 'Borrador · '}
                    Actualizado {FORMATTER.format(new Date(item.updatedAt))}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={() => onToggle(item)}
                    disabled={isPending}
                    aria-label={item.isActive ? 'Desactivar' : 'Activar'}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    aria-label="Editar"
                    disabled={isPending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-surface-alt hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40"
                  >
                    <Pencil aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    aria-label="Borrar"
                    disabled={isPending}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-fg-muted hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-40"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
