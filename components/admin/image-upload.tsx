'use client';

import imageCompression from 'browser-image-compression';
import { AlertCircle, ImagePlus, Loader2, X } from 'lucide-react';
import { useCallback, useId, useRef, useState } from 'react';

import { imagePublicUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';
import { deleteImageAction, uploadImageAction } from '@/server/actions/images';
import { type ImageNamespace } from '@/server/lib/images';

type Props = {
  namespace: ImageNamespace;
  /** Stored keyBase from a previous upload, or null when empty. */
  value: string | null;
  /** Called on every successful upload or remove. */
  onChange: (keyBase: string | null) => void;
  /** Optional label rendered above the tile. */
  label?: string;
  /** Optional hint copy under the tile (overrides default). */
  hint?: string;
  className?: string;
  disabled?: boolean;
};

type Stage = 'idle' | 'compressing' | 'uploading' | 'removing';

const COMPRESSION_OPTIONS = {
  // Sharp on the server still does the canonical resize/format conversion;
  // this is purely to keep mobile uploads under the 8MB action limit.
  maxSizeMB: 2,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  preserveExif: false,
} as const;

const ACCEPTED_INPUT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,image/*';

export function ImageUpload({
  namespace,
  value,
  onChange,
  label,
  hint,
  className,
  disabled,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('idle');
  const [error, setError] = useState<string | undefined>();
  const [isDragOver, setIsDragOver] = useState(false);

  const busy = stage !== 'idle' || disabled;

  const processFile = useCallback(
    async (raw: File) => {
      setError(undefined);

      let file = raw;
      if (raw.size > COMPRESSION_OPTIONS.maxSizeMB * 1024 * 1024) {
        try {
          setStage('compressing');
          file = await imageCompression(raw, COMPRESSION_OPTIONS);
        } catch (err) {
          console.error('[ImageUpload] compression failed', err);
          setStage('idle');
          setError('No pudimos preparar esa foto. Intenta con otra.');
          return;
        }
      }

      setStage('uploading');
      const fd = new FormData();
      fd.set('file', file);
      fd.set('namespace', namespace);

      const result = await uploadImageAction(undefined, fd);
      setStage('idle');

      if (!result || 'error' in result) {
        setError(result?.error ?? 'No pudimos subir la imagen.');
        return;
      }
      onChange(result.image.keyBase);
    },
    [namespace, onChange],
  );

  const onPickFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f) void processFile(f);
  };

  const onRemove = async () => {
    if (!value) return;
    setError(undefined);
    setStage('removing');
    const result = await deleteImageAction(value);
    setStage('idle');
    if (result && 'error' in result) {
      setError(result.error);
      return;
    }
    onChange(null);
  };

  const tileClasses = cn(
    'group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md',
    'border-[1.5px] border-dashed bg-bg text-fg-muted',
    'transition-colors duration-base ease-smooth',
    busy && 'cursor-progress',
    !busy && 'cursor-pointer hover:border-primary/60 hover:text-primary',
    isDragOver ? 'border-primary bg-primary-soft/40 text-primary' : 'border-border-strong',
  );

  const previewUrl = value ? imagePublicUrl(value, 'medium') : null;

  return (
    <div className={cn('flex w-full flex-col gap-2', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="font-sans text-[12px] font-medium tracking-[0.04em] text-fg-muted"
        >
          {label}
        </label>
      )}

      {previewUrl ? (
        <div className="group relative aspect-square w-full overflow-hidden rounded-md border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
          <button
            type="button"
            aria-label="Eliminar imagen"
            onClick={onRemove}
            disabled={busy}
            className={cn(
              'absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full',
              'bg-fg/70 text-fg-inverse backdrop-blur-sm',
              'transition-opacity hover:bg-fg/85',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <X aria-hidden className="h-4 w-4" strokeWidth={2} />
          </button>
          {stage === 'removing' && <BusyOverlay text="Eliminando…" />}
        </div>
      ) : (
        <div
          className={tileClasses}
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(e) => {
            if (busy) return;
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            if (busy) return;
            e.preventDefault();
            setIsDragOver(false);
            onPickFiles(e.dataTransfer.files);
          }}
          role="button"
          tabIndex={0}
          aria-busy={busy}
          onKeyDown={(e) => {
            if (busy) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <div className="flex flex-col items-center gap-1.5 px-4 text-center">
            <ImagePlus aria-hidden className="h-6 w-6" strokeWidth={1.5} />
            <span className="font-sans text-[13px] font-medium">
              Subir imagen
            </span>
            <span className="font-sans text-[11px] text-fg-subtle">
              {hint ?? 'Toca o arrastra · JPG, PNG, WebP'}
            </span>
          </div>
          {(stage === 'compressing' || stage === 'uploading') && (
            <BusyOverlay
              text={stage === 'compressing' ? 'Preparando…' : 'Subiendo…'}
            />
          )}
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPTED_INPUT}
        // No `capture` attribute: on iOS Safari it would force the camera
        // and hide the photo library. Without it, the OS shows the normal
        // "Photo Library / Take Photo / Choose File" sheet.
        className="sr-only"
        onChange={(e) => {
          onPickFiles(e.target.files);
          // Allow re-picking the same file after a remove.
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
    </div>
  );
}

function BusyOverlay({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg/80 backdrop-blur-sm">
      <Loader2 aria-hidden className="h-5 w-5 animate-spin text-primary" />
      <span className="font-sans text-[12px] font-medium text-fg-muted">
        {text}
      </span>
    </div>
  );
}

