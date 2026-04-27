'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import imageCompression from 'browser-image-compression';
import { AlertCircle, GripVertical, ImagePlus, Loader2, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';

import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';
import { deleteImageAction, uploadImageAction } from '@/server/actions/images';
import { type ImageNamespace } from '@/server/lib/images';

type Props = {
  namespace: ImageNamespace;
  /** Ordered keyBases of the gallery. Index 0 is the primary photo. */
  value: string[];
  onChange: (keys: string[]) => void;
  /** Soft cap on photos. Defaults to 8 (matches design + R2 budget). */
  maxImages?: number;
  /** Optional explanatory hint under the grid. */
  hint?: string;
  disabled?: boolean;
};

const DEFAULT_MAX = 8;

const COMPRESSION_OPTIONS = {
  // Server still does the canonical resize; this just keeps mobile uploads
  // under the 8 MB action limit without burning the user's data plan.
  maxSizeMB: 2,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  preserveExif: false,
} as const;

const ACCEPTED_INPUT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,image/*';

type PendingTile = { id: string };

export function ImageGallery({
  namespace,
  value,
  onChange,
  maxImages = DEFAULT_MAX,
  hint,
  disabled,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingTile[]>([]);
  const [error, setError] = useState<string | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const totalCount = value.length + pending.length;
  const canAddMore = !disabled && totalCount < maxImages;

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = value.indexOf(String(active.id));
    const newIdx = value.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    onChange(arrayMove(value, oldIdx, newIdx));
  };

  const removeKey = (key: string) => {
    onChange(value.filter((k) => k !== key));
    // Best-effort R2 cleanup. We don't surface failures — user already saw
    // the tile disappear; orphaning a single object isn't worth a banner.
    void deleteImageAction(key).catch(() => {});
  };

  const uploadOne = async (raw: File): Promise<string | null> => {
    let file = raw;
    if (raw.size > COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024) {
      try {
        file = await imageCompression(raw, COMPRESSION_OPTIONS);
      } catch (err) {
        console.error('[ImageGallery] compression failed', err);
        return null;
      }
    }
    const fd = new FormData();
    fd.set('file', file);
    fd.set('namespace', namespace);
    const result = await uploadImageAction(undefined, fd);
    if (!result || 'error' in result) {
      setError(result?.error ?? 'No pudimos subir una de las imágenes.');
      return null;
    }
    return result.image.keyBase;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(undefined);

    // Honor the cap. If the user picked more than what fits, take the first N.
    const remaining = Math.max(0, maxImages - totalCount);
    const queue = Array.from(files).slice(0, remaining);
    if (queue.length < files.length) {
      setError(`Máximo ${maxImages} imágenes. Subimos las primeras ${queue.length}.`);
    }

    const tiles: PendingTile[] = queue.map(() => ({
      id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }));
    setPending((p) => [...p, ...tiles]);

    // Upload sequentially so the order in the gallery matches pick order even
    // if the user added several at once.
    const uploaded: string[] = [];
    for (const file of queue) {
      const key = await uploadOne(file);
      if (key) uploaded.push(key);
    }

    setPending((p) => p.filter((t) => !tiles.includes(t)));
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <ul className="grid grid-cols-4 gap-2">
            {value.map((key, idx) => (
              <li key={key}>
                <SortableTile
                  keyBase={key}
                  isPrimary={idx === 0}
                  disabled={!!disabled}
                  onRemove={() => removeKey(key)}
                />
              </li>
            ))}
            {pending.map((p) => (
              <li key={p.id}>
                <PendingTileBox />
              </li>
            ))}
            {canAddMore && (
              <li>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    'group flex aspect-square w-full flex-col items-center justify-center gap-1.5',
                    'rounded-md border-[1.5px] border-dashed border-border-strong bg-bg text-fg-muted',
                    'transition-colors duration-base ease-smooth',
                    'hover:border-primary/60 hover:text-primary',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  )}
                >
                  <ImagePlus aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                  <span className="font-sans text-[11px] font-medium">Añadir</span>
                </button>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_INPUT}
        multiple
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-sans text-[12px] font-medium text-destructive"
        >
          <AlertCircle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <p className="font-sans text-[11px] text-fg-subtle">
        {hint ?? `Hasta ${maxImages} fotos · arrastra para reordenar · la primera es la principal`}
      </p>
    </div>
  );
}

function SortableTile({
  keyBase,
  isPrimary,
  disabled,
  onRemove,
}: {
  keyBase: string;
  isPrimary: boolean;
  disabled: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: keyBase });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const src = tryImagePublicUrl(keyBase, 'thumb');

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging || undefined}
      className={cn(
        'group relative aspect-square w-full overflow-hidden rounded-md border border-border bg-surface',
        'transition-shadow duration-base ease-smooth',
        'data-[dragging]:z-10 data-[dragging]:scale-[1.05] data-[dragging]:border-primary data-[dragging]:shadow-lg',
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary-soft text-primary/60">
          <ImagePlus aria-hidden className="h-5 w-5" strokeWidth={1.5} />
        </div>
      )}

      {isPrimary && (
        <span
          aria-hidden
          className="absolute left-1 top-1 rounded-sm bg-primary px-1.5 py-px font-sans text-[9px] font-semibold uppercase tracking-[0.06em] text-primary-foreground"
        >
          Principal
        </span>
      )}

      <button
        type="button"
        aria-label="Reordenar"
        disabled={disabled}
        className={cn(
          'absolute bottom-1 left-1 inline-flex h-7 w-7 items-center justify-center rounded-full',
          'bg-fg/70 text-fg-inverse backdrop-blur-sm',
          'cursor-grab touch-none active:cursor-grabbing',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <button
        type="button"
        aria-label="Eliminar imagen"
        onClick={onRemove}
        disabled={disabled}
        className={cn(
          'absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full',
          'bg-fg/70 text-fg-inverse backdrop-blur-sm',
          'transition-opacity hover:bg-fg/85',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <X aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function PendingTileBox() {
  return (
    <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border-strong bg-bg/60">
      <div className="flex flex-col items-center gap-1.5 text-fg-muted">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin text-primary" />
        <span className="font-sans text-[10px] font-medium">Subiendo…</span>
      </div>
    </div>
  );
}
