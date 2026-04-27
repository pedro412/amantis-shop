'use client';

import { AlertCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { softDeleteCategoryAction } from '@/server/actions/categories';

type Props = {
  categoryId: string;
  productCount: number;
};

export function DangerZone({ categoryId, productCount }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();

  const blocked = productCount > 0;

  const onConfirmDelete = () => {
    if (blocked) return;
    setServerError(undefined);
    startTransition(async () => {
      const result = await softDeleteCategoryAction(categoryId);
      if ('error' in result) {
        setServerError(result.error);
        return;
      }
      setOpen(false);
      router.push('/admin/categorias');
      router.refresh();
    });
  };

  return (
    <div className="border-t border-border pt-5">
      <AlertDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setServerError(undefined);
        }}
      >
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 font-sans text-[14px] font-medium text-destructive transition-colors hover:text-destructive/80"
          >
            <Trash2 aria-hidden className="h-4 w-4" strokeWidth={1.75} />
            Eliminar categoría
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blocked ? 'No se puede eliminar' : '¿Eliminar esta categoría?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {blocked
                ? `Esta categoría tiene ${productCount} ${productCount === 1 ? 'producto asociado' : 'productos asociados'}. Desactívala con el toggle de arriba en lugar de eliminarla.`
                : 'Esta acción la oculta del catálogo y del panel. Podrás restaurarla manualmente más tarde.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {serverError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 px-3.5 py-3 font-sans text-[13px] font-medium text-destructive"
            >
              <AlertCircle aria-hidden className="mt-px h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{serverError}</span>
            </div>
          )}

          <AlertDialogFooter>
            {blocked ? (
              <AlertDialogClose asChild>
                <Button variant="primary" size="md" className="w-full sm:w-auto">
                  Entendido
                </Button>
              </AlertDialogClose>
            ) : (
              <>
                <AlertDialogClose asChild>
                  <Button variant="ghost" size="md" disabled={pending}>
                    Cancelar
                  </Button>
                </AlertDialogClose>
                <Button
                  type="button"
                  variant="destructive"
                  size="md"
                  onClick={onConfirmDelete}
                  disabled={pending}
                >
                  {pending ? 'Eliminando…' : 'Eliminar'}
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
