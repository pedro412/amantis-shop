'use client';

import { LogOut, Menu } from 'lucide-react';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { logoutAction } from '@/server/actions/auth';

type Props = {
  userName: string | null;
  userEmail: string;
};

export function AdminMenuSheet({ userName, userEmail }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className="-ml-1.5 inline-flex h-11 w-11 items-center justify-center rounded-md text-fg transition-colors duration-base ease-smooth hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu aria-hidden className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col p-7">
        <div className="mb-8 mt-1 flex items-center gap-2">
          <Logo size={20} />
          <span aria-hidden className="h-[14px] w-px bg-border" />
          <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-fg-muted">
            Panel
          </span>
        </div>

        <SheetTitle className="text-[22px]">
          {userName ? `Hola, ${userName}.` : 'Hola.'}
        </SheetTitle>
        <SheetDescription className="mt-1 text-[13px]">
          {userEmail}
        </SheetDescription>

        <form
          action={() => startTransition(() => logoutAction())}
          className="mt-auto"
        >
          <Button
            type="submit"
            variant="ghost"
            className="h-11 w-full justify-start gap-3 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={pending}
          >
            <LogOut aria-hidden className="h-5 w-5" />
            {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
