import { redirect } from 'next/navigation';

import { auth } from '@/auth';
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
      <main className="flex-1 pb-[88px]">{children}</main>
      <AdminTabBar />
    </div>
  );
}
