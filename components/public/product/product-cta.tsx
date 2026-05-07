'use client';

import { Check, MessageCircle, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CartBump } from '@/components/public/cart-bump';
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
    'Hola A’Mantis, me interesa este producto:',
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
      <div className="flex items-center gap-2 px-3 py-2">
        <Button
          type="button"
          onClick={onAddToCart}
          disabled={!available || justAdded}
          variant="primary"
          size="md"
          className={cn(
            'flex-1',
            // Success flash after adding — overrides primary bg until reset.
            justAdded && 'bg-success text-fg-inverse hover:bg-success active:bg-success',
          )}
        >
          {justAdded ? (
            <>
              <CartBump>
                <Check aria-hidden strokeWidth={2.25} />
              </CartBump>
              Agregado
            </>
          ) : (
            <>
              <CartBump>
                <ShoppingBag aria-hidden strokeWidth={1.75} />
              </CartBump>
              {available ? 'Agregar al carrito' : 'No disponible'}
            </>
          )}
        </Button>

        <Button asChild variant="secondary" size="icon">
          <a
            href={buildWhatsappUrl(message)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Pedir por WhatsApp"
          >
            <MessageCircle aria-hidden strokeWidth={1.75} />
          </a>
        </Button>
      </div>
    </div>
  );
}
