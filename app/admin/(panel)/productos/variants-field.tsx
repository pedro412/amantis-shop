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
import { ChevronDown, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useId, useMemo, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { VariantRowErrors } from '@/server/actions/products';

export type VariantInput = {
  /** Local identifier used only for drag + React keys; never sent to the server. */
  rowId: string;
  name: string;
  sku: string;
  priceOverride: string;
  stock: string;
};

export function makeEmptyVariant(): VariantInput {
  return {
    rowId: `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    sku: '',
    priceOverride: '',
    stock: '0',
  };
}

type Props = {
  value: VariantInput[];
  onChange: (next: VariantInput[]) => void;
  rowErrors: Record<number, VariantRowErrors> | undefined;
  disabled?: boolean;
};

const MAX_VARIANTS = 20;

export function VariantsField({ value, onChange, rowErrors, disabled }: Props) {
  const headingId = useId();
  // Default open whenever there are existing rows so editors land on the data;
  // collapsed otherwise to keep the create form short.
  const [open, setOpen] = useState(value.length > 0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const totalStock = useMemo(
    () =>
      value.reduce((acc, v) => {
        const n = Number(v.stock);
        return Number.isFinite(n) ? acc + n : acc;
      }, 0),
    [value],
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = value.findIndex((v) => v.rowId === active.id);
    const newIdx = value.findIndex((v) => v.rowId === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onChange(arrayMove(value, oldIdx, newIdx));
  };

  const updateRow = (rowId: string, patch: Partial<VariantInput>) => {
    onChange(value.map((v) => (v.rowId === rowId ? { ...v, ...patch } : v)));
  };

  const removeRow = (rowId: string) => {
    onChange(value.filter((v) => v.rowId !== rowId));
  };

  const addRow = () => {
    if (value.length >= MAX_VARIANTS) return;
    onChange([...value, makeEmptyVariant()]);
    setOpen(true);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-lg border border-border bg-surface"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-1">
          <p id={headingId} className="font-sans text-[14px] font-medium text-fg">
            Variantes
          </p>
          <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
            {value.length === 0
              ? 'Talla, color, sabor… cada una con su propio stock.'
              : `${value.length} ${value.length === 1 ? 'variante' : 'variantes'} · stock total ${totalStock}`}
          </p>
        </div>
        <ChevronDown
          aria-hidden
          className={cn(
            'h-4 w-4 shrink-0 text-fg-muted transition-transform duration-base ease-smooth',
            open && 'rotate-180',
          )}
          strokeWidth={1.75}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4">
          {value.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onDragEnd}
            >
              <SortableContext
                items={value.map((v) => v.rowId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col gap-3">
                  {value.map((row, idx) => (
                    <li key={row.rowId}>
                      <VariantRow
                        row={row}
                        index={idx}
                        errors={rowErrors?.[idx]}
                        disabled={!!disabled}
                        onChange={(patch) => updateRow(row.rowId, patch)}
                        onRemove={() => removeRow(row.rowId)}
                      />
                    </li>
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}

          <button
            type="button"
            onClick={addRow}
            disabled={disabled || value.length >= MAX_VARIANTS}
            className={cn(
              'mt-3 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md',
              'border border-dashed border-border-strong bg-bg font-sans text-[13px] font-medium text-fg-muted',
              'transition-colors duration-base ease-smooth',
              'hover:border-primary/60 hover:text-primary',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong disabled:hover:text-fg-muted',
            )}
          >
            <Plus aria-hidden className="h-4 w-4" strokeWidth={2} />
            {value.length === 0 ? 'Agregar variante' : 'Agregar otra'}
          </button>
          {value.length >= MAX_VARIANTS && (
            <p className="mt-2 font-sans text-[11px] text-fg-subtle">
              Máximo {MAX_VARIANTS} variantes.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function VariantRow({
  row,
  index,
  errors,
  disabled,
  onChange,
  onRemove,
}: {
  row: VariantInput;
  index: number;
  errors: VariantRowErrors | undefined;
  disabled: boolean;
  onChange: (patch: Partial<VariantInput>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.rowId });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const nameId = `variant-${row.rowId}-name`;
  const skuId = `variant-${row.rowId}-sku`;
  const priceId = `variant-${row.rowId}-price`;
  const stockId = `variant-${row.rowId}-stock`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging || undefined}
      className={cn(
        'rounded-md border border-border bg-bg p-3',
        'transition-shadow duration-base ease-smooth',
        'data-[dragging]:z-10 data-[dragging]:border-primary data-[dragging]:shadow-lg',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Reordenar variante ${index + 1}`}
          disabled={disabled}
          className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            'text-fg-muted hover:bg-surface-alt hover:text-fg',
            'cursor-grab touch-none active:cursor-grabbing',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden className="h-4 w-4" strokeWidth={2} />
        </button>
        <p className="flex-1 font-sans text-[12px] font-medium uppercase tracking-[0.04em] text-fg-subtle">
          Variante {index + 1}
        </p>
        <button
          type="button"
          aria-label="Eliminar variante"
          onClick={onRemove}
          disabled={disabled}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-md',
            'text-fg-muted hover:bg-destructive/10 hover:text-destructive',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <Trash2 aria-hidden className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <RowField htmlFor={nameId} label="Nombre" error={errors?.name}>
          <Input
            id={nameId}
            autoComplete="off"
            placeholder='Ej. "Talla L" · "Color negro"'
            disabled={disabled}
            aria-invalid={!!errors?.name}
            value={row.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </RowField>

        <div className="grid grid-cols-2 gap-3">
          <RowField htmlFor={stockId} label="Stock" error={errors?.stock}>
            <Input
              id={stockId}
              type="text"
              inputMode="numeric"
              placeholder="0"
              disabled={disabled}
              aria-invalid={!!errors?.stock}
              value={row.stock}
              onChange={(e) => onChange({ stock: e.target.value })}
            />
          </RowField>
          <RowField
            htmlFor={priceId}
            label="Precio (opcional)"
            error={errors?.priceOverride}
          >
            <Input
              id={priceId}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              disabled={disabled}
              aria-invalid={!!errors?.priceOverride}
              value={row.priceOverride}
              onChange={(e) => onChange({ priceOverride: e.target.value })}
            />
          </RowField>
        </div>

        <RowField htmlFor={skuId} label="SKU (opcional)" error={errors?.sku}>
          <Input
            id={skuId}
            autoComplete="off"
            autoCapitalize="characters"
            disabled={disabled}
            aria-invalid={!!errors?.sku}
            value={row.sku}
            onChange={(e) => onChange({ sku: e.target.value })}
          />
        </RowField>
      </div>
    </div>
  );
}

function RowField({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5 text-[12px]">
        {label}
      </Label>
      {children}
      {error && (
        <p className="mt-1.5 font-sans text-[12px] text-destructive">{error}</p>
      )}
    </div>
  );
}
