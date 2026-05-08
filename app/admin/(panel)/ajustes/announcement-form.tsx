'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  type AnnouncementFieldErrors,
  createAnnouncementAction,
  updateAnnouncementAction,
} from '@/server/actions/announcements';

const MESSAGE_LIMIT = 200;

type Mode =
  | { kind: 'create' }
  | { kind: 'edit'; id: string; message: string; isActive: boolean };

type Props = {
  mode: Mode;
  onCancel?: () => void;
};

export function AnnouncementForm({ mode, onCancel }: Props) {
  const isEdit = mode.kind === 'edit';

  const [message, setMessage] = useState(isEdit ? mode.message : '');
  const [isActive, setIsActive] = useState(isEdit ? mode.isActive : false);
  const [serverError, setServerError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<AnnouncementFieldErrors>({});
  const [savedFlash, setSavedFlash] = useState(false);
  const [pending, startTransition] = useTransition();
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    };
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(undefined);
    setFieldErrors({});

    const trimmed = message.trim();
    if (!trimmed) {
      setFieldErrors({ message: 'Escribe el mensaje del anuncio.' });
      return;
    }

    const formData = new FormData();
    formData.set('message', trimmed);
    formData.set('isActive', isActive ? 'true' : 'false');
    if (isEdit) formData.set('id', mode.id);

    startTransition(async () => {
      const result = isEdit
        ? await updateAnnouncementAction(undefined, formData)
        : await createAnnouncementAction(undefined, formData);

      if (!result || 'error' in result) {
        setServerError(result?.error ?? 'No se pudo guardar.');
        if (result && 'fieldErrors' in result && result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        return;
      }

      setSavedFlash(true);
      flashTimer.current = setTimeout(() => setSavedFlash(false), 1500);
      if (!isEdit) {
        setMessage('');
        setIsActive(false);
      }
    });
  };

  const remaining = MESSAGE_LIMIT - message.length;
  const messageError = fieldErrors.message;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={isEdit ? `msg-${mode.id}` : 'msg-new'}>
          Mensaje
        </Label>
        <Textarea
          id={isEdit ? `msg-${mode.id}` : 'msg-new'}
          rows={2}
          maxLength={MESSAGE_LIMIT}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ej. 3 meses sin intereses en compras desde $1,500"
          aria-invalid={!!messageError}
          className={cn(messageError && 'border-destructive')}
        />
        <div className="flex items-center justify-between font-sans text-[11px]">
          <span className={cn('text-fg-subtle', messageError && 'text-destructive')}>
            {messageError ?? `${remaining} restantes`}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2.5">
        <div className="min-w-0">
          <p className="font-sans text-[13px] font-medium text-fg">
            Activo
          </p>
          <p className="mt-0.5 font-sans text-[11px] leading-snug text-fg-muted">
            Al activar, este anuncio reemplaza cualquier otro activo.
          </p>
        </div>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          aria-label="Activar anuncio"
        />
      </div>

      {serverError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-sans text-[12px] text-destructive">
          <AlertCircle aria-hidden className="mt-0.5 h-4 w-4" strokeWidth={2} />
          <span>{serverError}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={pending}
        >
          {pending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear anuncio'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            Cancelar
          </Button>
        )}
        {savedFlash && (
          <span className="inline-flex items-center gap-1 font-sans text-[12px] text-success">
            <CheckCircle2 aria-hidden className="h-4 w-4" strokeWidth={2} />
            Guardado
          </span>
        )}
      </div>
    </form>
  );
}
