import { cookies } from 'next/headers';
import { Toaster } from 'sonner';

import { AgeGate } from '@/components/public/age-gate';
import { AnnouncementBar } from '@/components/public/announcement-bar';
import { CartProvider } from '@/components/public/cart-context';
import { PublicBottomNav } from '@/components/public/public-bottom-nav';
import { PublicFooter } from '@/components/public/public-footer';
import { PublicHeader } from '@/components/public/public-header';
import { AGE_COOKIE, AGE_VALUE } from '@/lib/age-gate';
import { getActiveAnnouncement } from '@/server/queries/announcements';
import { getDrawerCategories } from '@/server/queries/categories';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // SSR cookie check is the source of truth so verified visitors never see the
  // gate flicker. Children render in the DOM behind the gate either way so
  // crawlers index the catalog regardless of cookie state.
  const ageVerified = cookies().get(AGE_COOKIE)?.value === AGE_VALUE;
  const [announcement, drawerCategories] = await Promise.all([
    getActiveAnnouncement(),
    getDrawerCategories(),
  ]);

  return (
    <CartProvider>
      {/* Outer container reserves space for the fixed bottom nav so the footer's
          last line never sits under the nav. The reservation lives on the bg-bg
          container (not the footer) so the nav's backdrop-blur sees the page
          cream — putting it on the surface-alt footer would bleed that color
          behind the nav. */}
      <div className="flex min-h-dvh flex-col bg-bg pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        {announcement && (
          <AnnouncementBar id={announcement.id} message={announcement.message} />
        )}
        <PublicHeader categories={drawerCategories} />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <PublicBottomNav />
      </div>
      {!ageVerified && <AgeGate />}
      <Toaster
        position="top-center"
        theme="light"
        richColors={false}
        closeButton={false}
        toastOptions={{
          className: 'font-sans text-[13px]',
          style: {
            background: 'hsl(var(--bg))',
            color: 'hsl(var(--fg))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </CartProvider>
  );
}
