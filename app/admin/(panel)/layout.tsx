import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminTabBar } from '@/components/admin/admin-tab-bar';
import { LOGIN_PATH } from '@/server/lib/auth-routes';

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect(LOGIN_PATH);

  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <AdminHeader
        title="Panel"
        userName={session.user.name ?? null}
        userEmail={session.user.email}
      />
      <main className="flex-1 px-5 pb-[88px] pt-5">{children}</main>
      <AdminTabBar />
    </div>
  );
}
