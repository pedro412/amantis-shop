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
import { softDeleteProductAction } from '@/server/actions/products';

type Props = { productId: string };

export function ProductDangerZone({ productId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | undefined>();

  const onConfirmDelete = () => {
    setServerError(undefined);
    startTransition(async () => {
      const result = await softDeleteProductAction(productId);
      if ('error' in result) {
        setServerError(result.error);
        return;
      }
      setOpen(false);
      router.push('/admin/productos');
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
            Eliminar producto
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Lo ocultamos del catálogo y del panel. Liberamos el slug y el SKU
              para reutilizarlos. Podrás restaurarlo manualmente más tarde
              desde la base de datos.
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
