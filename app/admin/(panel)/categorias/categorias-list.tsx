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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, ChevronRight, GripVertical, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { tryImagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';
import { reorderCategoriesAction } from '@/server/actions/categories';

export type CategoryNode = {
  id: string;
  name: string;
  imageKey: string | null;
  isActive: boolean;
  productCount: number;
};

export type ParentNode = CategoryNode & { children: CategoryNode[] };

type Props = { categories: ParentNode[] };

export function CategoriasList({ categories: initial }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initial);
  const [error, setError] = useState<string | undefined>();
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const persistOrder = (
    parentId: string | null,
    orderedIds: string[],
    rollback: () => void,
  ) => {
    setError(undefined);
    startTransition(async () => {
      const result = await reorderCategoriesAction({ parentId, orderedIds });
      if ('error' in result) {
        rollback();
        setError(result.error);
        router.refresh();
      }
    });
  };

  const onParentDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = categories.findIndex((c) => c.id === active.id);
    const newIdx = categories.findIndex((c) => c.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const previous = categories;
    const next = arrayMove(categories, oldIdx, newIdx);
    setCategories(next);
    persistOrder(
      null,
      next.map((c) => c.id),
      () => setCategories(previous),
    );
  };

  const onChildDragEnd = (parentId: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const parent = categories.find((p) => p.id === parentId);
    if (!parent) return;
    const oldIdx = parent.children.findIndex((c) => c.id === active.id);
    const newIdx = parent.children.findIndex((c) => c.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const nextChildren = arrayMove(parent.children, oldIdx, newIdx);
    const previous = categories;
    const next = categories.map((p) =>
      p.id === parentId ? { ...p, children: nextChildren } : p,
    );
    setCategories(next);
    persistOrder(
      parentId,
      nextChildren.map((c) => c.id),
      () => setCategories(previous),
    );
  };

  return (
    <div className="px-4 pb-4 pt-3">
      <p className="px-2 pb-3 font-sans text-[12px] leading-relaxed text-fg-muted">
        Mantén presionado el ícono para reordenar. Toca una categoría para
        editarla.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-3 font-sans text-[13px] font-medium text-destructive"
        >
          <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
          <span>{error}</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onParentDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {categories.map((parent) => (
              <li key={parent.id}>
                <SortableRow
                  id={parent.id}
                  name={parent.name}
                  imageKey={parent.imageKey}
                  isActive={parent.isActive}
                  productCount={parent.productCount}
                />
                {parent.children.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onChildDragEnd(parent.id)}
                  >
                    <SortableContext
                      items={parent.children.map((c) => c.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <ul className="ml-5 mt-2 flex flex-col gap-1.5 border-l border-border pl-4">
                        {parent.children.map((child) => (
                          <li key={child.id}>
                            <SortableRow
                              id={child.id}
                              name={child.name}
                              imageKey={child.imageKey}
                              isActive={child.isActive}
                              productCount={child.productCount}
                              variant="child"
                            />
                          </li>
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                )}
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableRow({
  id,
  name,
  imageKey,
  isActive,
  productCount,
  variant = 'parent',
}: {
  id: string;
  name: string;
  imageKey: string | null;
  isActive: boolean;
  productCount: number;
  variant?: 'parent' | 'child';
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const isChild = variant === 'child';
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const src = imageKey ? tryImagePublicUrl(imageKey, 'thumb') : null;
  const thumbSize = isChild ? 32 : 40;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging || undefined}
      className={cn(
        'flex items-center gap-1 rounded-xl border border-border bg-surface',
        'transition-shadow duration-base ease-smooth',
        'data-[dragging]:z-10 data-[dragging]:scale-[1.02] data-[dragging]:border-primary data-[dragging]:shadow-lg',
        isChild ? 'pl-1 pr-2 py-1.5' : 'pl-1 pr-2 py-2',
      )}
    >
      <button
        type="button"
        aria-label={`Reordenar ${name}`}
        className={cn(
          'flex h-11 w-9 shrink-0 cursor-grab touch-none items-center justify-center text-fg-subtle',
          'rounded-md transition-colors hover:text-fg-muted',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          'active:cursor-grabbing',
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical aria-hidden className="h-4 w-4" strokeWidth={1.75} />
      </button>

      <Link
        href={`/admin/categorias/${id}`}
        className={cn(
          'flex flex-1 items-center gap-3 rounded-lg',
          'transition-colors duration-base ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
          isChild ? 'px-2 py-1.5' : 'px-2.5 py-2',
        )}
      >
        <Thumb imageKey={imageKey} src={src} alt={name} size={thumbSize} />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate font-sans font-medium text-fg',
              isChild ? 'text-[13px]' : 'text-[14px]',
            )}
          >
            {name}
          </p>
          <p
            className={cn(
              'mt-0.5 font-sans text-fg-muted',
              isChild ? 'text-[10.5px]' : 'text-[11px]',
            )}
          >
            {productCount} {productCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <ActiveDot active={isActive} />
        <ChevronRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-fg-subtle"
          strokeWidth={1.75}
        />
      </Link>
    </div>
  );
}

function Thumb({
  imageKey,
  src,
  alt,
  size,
}: {
  imageKey: string | null;
  src: string | null;
  alt: string;
  size: number;
}) {
  const dim = size === 32 ? 'h-8 w-8' : 'h-10 w-10';
  if (imageKey && src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn('shrink-0 rounded-md object-cover', dim)}
        draggable={false}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary/60',
        dim,
      )}
    >
      <ImageIcon className={size === 32 ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={1.75} />
    </div>
  );
}

function ActiveDot({ active }: { active: boolean }) {
  return (
    <span
      aria-label={active ? 'Activa' : 'Inactiva'}
      className={cn(
        'h-1.5 w-1.5 shrink-0 rounded-full',
        active ? 'bg-success' : 'bg-fg-subtle/60',
      )}
    />
  );
}
