'use client';

import { Check, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useCart } from '@/components/public/cart-context';
import { Button } from '@/components/ui/button';
import { formatMXN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { buildWhatsappUrl } from '@/lib/whatsapp';

import { useProductSelection } from './product-selection-context';

const FEEDBACK_DURATION_MS = 1200;

export function ProductCTA() {
  const { product, selectedVariant, displayPrice, available } = useProductSelection();
  const { add } = useCart();

  const [origin, setOrigin] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), FEEDBACK_DURATION_MS);
    return () => clearTimeout(t);
  }, [justAdded]);

  const productUrl = origin ? `${origin}/producto/${product.slug}` : '';
  const variantSuffix = selectedVariant ? ` — variante: ${selectedVariant.name}` : '';
  const message = [
    'Hola Ámantis, me interesa este producto:',
    '',
    `• ${product.name}${variantSuffix} — ${formatMXN(Number(displayPrice))}`,
    '',
    productUrl,
  ]
    .filter(Boolean)
    .join('\n');

  const onAddToCart = () => {
    if (!available || justAdded) return;
    add(
      {
        lineId: `${product.id}::${selectedVariant?.id ?? 'base'}`,
        productId: product.id,
        slug: product.slug,
        variantId: selectedVariant?.id ?? null,
        name: product.name,
        variantLabel: selectedVariant?.name ?? null,
        unitPrice: Number(displayPrice),
        thumbnailKey: product.imageKeys[0] ?? null,
      },
      1,
    );
    setJustAdded(true);
  };

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-30 border-t border-border/60 bg-bg/85 backdrop-blur-sm',
        'supports-[backdrop-filter]:bg-bg/70',
        // Sit just above the fixed bottom nav (h-14 + iOS safe inset).
        'bottom-[calc(3.5rem+env(safe-area-inset-bottom))]',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!available || justAdded}
          aria-label={
            justAdded ? 'Agregado al carrito' : 'Agregar al carrito'
          }
          className={cn(
            'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px]',
            'transition-colors duration-base ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
            justAdded
              ? 'border-success bg-success text-fg-inverse'
              : 'border-primary bg-bg text-primary hover:bg-primary-soft active:bg-primary-soft',
            !available && !justAdded && 'cursor-not-allowed border-border text-fg-subtle hover:bg-bg',
          )}
        >
          {justAdded ? (
            <Check aria-hidden className="h-5 w-5" strokeWidth={2.25} />
          ) : (
            <ShoppingBag aria-hidden className="h-5 w-5" strokeWidth={1.75} />
          )}
        </button>

        <Button
          asChild
          size="lg"
          variant="primary"
          className="flex-1"
        >
          <a
            href={buildWhatsappUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Pedir por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
