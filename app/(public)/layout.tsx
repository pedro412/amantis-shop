import { CartProvider } from '@/components/public/cart-context';
import { PublicBottomNav } from '@/components/public/public-bottom-nav';
import { PublicFooter } from '@/components/public/public-footer';
import { PublicHeader } from '@/components/public/public-header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {/* Outer container reserves space for the fixed bottom nav so the footer's
          last line never sits under the nav. The reservation lives on the bg-bg
          container (not the footer) so the nav's backdrop-blur sees the page
          cream — putting it on the surface-alt footer would bleed that color
          behind the nav. */}
      <div className="flex min-h-dvh flex-col bg-bg pb-[calc(3.5rem+env(safe-area-inset-bottom))]">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <PublicBottomNav />
      </div>
    </CartProvider>
  );
}
