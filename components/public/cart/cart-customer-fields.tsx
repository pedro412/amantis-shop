'use client';

import { Check } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMXN } from '@/lib/format';
import {
  SHIPPING_COSTS,
  SHIPPING_LABELS,
  type ShippingType,
} from '@/lib/customer-info';
import { cn } from '@/lib/utils';

import { useCustomerInfo } from './customer-info-context';

const OPTIONS: {
  type: ShippingType;
  title: string;
  hint: string;
}[] = [
  {
    type: 'pickup',
    title: SHIPPING_LABELS.pickup,
    hint: 'Recoges tu pedido en local. Sin costo de envío.',
  },
  {
    type: 'mandaditos',
    title: SHIPPING_LABELS.mandaditos,
    hint: 'Te llevamos el pedido con servicio de mandaditos.',
  },
  {
    type: 'national',
    title: SHIPPING_LABELS.national,
    hint: 'Coordinamos paquetería contigo. Costo a confirmar.',
  },
];

function shippingCostLabel(type: ShippingType): string {
  const cost = SHIPPING_COSTS[type];
  return cost === null ? 'Por confirmar' : cost === 0 ? 'Sin costo' : formatMXN(cost);
}

export function CartCustomerFields() {
  const { info, hydrated, setField } = useCustomerInfo();

  const showLocal = info.shippingType === 'mandaditos';
  const showNational = info.shippingType === 'national';
  const showCommon = info.shippingType !== null;

  return (
    <section className="mt-2 space-y-5 px-4 pb-2" aria-labelledby="customer-fields-heading">
      <div>
        <h2
          id="customer-fields-heading"
          className="font-sans text-[14px] font-semibold text-fg"
        >
          Tipo de envío
        </h2>
        <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
          Elige cómo quieres recibir tu pedido.
        </p>

        <ul className="mt-3 space-y-2">
          {OPTIONS.map((opt) => {
            const selected = info.shippingType === opt.type;
            return (
              <li key={opt.type}>
                <button
                  type="button"
                  onClick={() => setField('shippingType', opt.type)}
                  aria-pressed={selected}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    selected
                      ? 'border-primary bg-primary-soft'
                      : 'border-border bg-bg hover:border-border-strong',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px]',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-bg',
                    )}
                  >
                    {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-sans text-[14px] font-medium text-fg">
                        {opt.title}
                      </span>
                      <span
                        className={cn(
                          'shrink-0 font-sans text-[12px] font-semibold tabular-nums',
                          selected ? 'text-primary' : 'text-fg-muted',
                        )}
                      >
                        {shippingCostLabel(opt.type)}
                      </span>
                    </span>
                    <span className="mt-0.5 block font-sans text-[12px] leading-snug text-fg-muted">
                      {opt.hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {showCommon && (
        <div className="space-y-3">
          <h3 className="font-sans text-[14px] font-semibold text-fg">Tus datos</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer-name">Nombre</Label>
              <Input
                id="customer-name"
                type="text"
                inputMode="text"
                autoComplete="name"
                placeholder="Cómo te llamas"
                value={hydrated ? info.name : ''}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="customer-phone">Teléfono</Label>
              <Input
                id="customer-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="938 123 4567"
                value={hydrated ? info.phone : ''}
                onChange={(e) => setField('phone', e.target.value)}
              />
            </div>
          </div>

          {showLocal && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="customer-local-address">Dirección de entrega</Label>
                <Input
                  id="customer-local-address"
                  type="text"
                  inputMode="text"
                  autoComplete="street-address"
                  placeholder="Calle, número, colonia"
                  value={hydrated ? info.localAddress : ''}
                  onChange={(e) => setField('localAddress', e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-local-notes">
                  Referencias{' '}
                  <span className="font-normal text-fg-subtle">(opcional)</span>
                </Label>
                <Input
                  id="customer-local-notes"
                  type="text"
                  inputMode="text"
                  placeholder="Ej. casa azul, frente a la tienda"
                  value={hydrated ? info.localNotes : ''}
                  onChange={(e) => setField('localNotes', e.target.value)}
                />
              </div>
            </>
          )}

          {showNational && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customer-city">Ciudad</Label>
                  <Input
                    id="customer-city"
                    type="text"
                    autoComplete="address-level2"
                    placeholder="Mérida"
                    value={hydrated ? info.city : ''}
                    onChange={(e) => setField('city', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customer-state">Estado</Label>
                  <Input
                    id="customer-state"
                    type="text"
                    autoComplete="address-level1"
                    placeholder="Yucatán"
                    value={hydrated ? info.state : ''}
                    onChange={(e) => setField('state', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-street">Calle y número</Label>
                <Input
                  id="customer-street"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Av. Reforma 123"
                  value={hydrated ? info.street : ''}
                  onChange={(e) => setField('street', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customer-neighborhood">Colonia</Label>
                  <Input
                    id="customer-neighborhood"
                    type="text"
                    autoComplete="address-level3"
                    placeholder="Centro"
                    value={hydrated ? info.neighborhood : ''}
                    onChange={(e) => setField('neighborhood', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customer-zip">Código postal</Label>
                  <Input
                    id="customer-zip"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    placeholder="97000"
                    value={hydrated ? info.zip : ''}
                    onChange={(e) => setField('zip', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
