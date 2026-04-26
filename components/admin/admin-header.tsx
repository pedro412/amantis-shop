import { AdminMenuSheet } from './admin-menu-sheet';

type Props = {
  title: string;
  userName: string | null;
  userEmail: string;
  action?: React.ReactNode;
};

export function AdminHeader({ title, userName, userEmail, action }: Props) {
  const monogram = (userName?.trim()[0] ?? userEmail[0] ?? 'A').toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-surface px-5 py-3.5">
      <AdminMenuSheet userName={userName} userEmail={userEmail} />

      <div className="flex-1">
        <h1 className="font-serif text-[20px] font-medium leading-none text-fg">
          {title}
        </h1>
      </div>

      {action ?? (
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft font-serif text-[16px] font-medium text-primary"
        >
          {monogram}
        </span>
      )}
    </header>
  );
}
