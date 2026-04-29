'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useCustomerInfo } from './customer-info-context';

const MAX_LEN = 80;

export function CartCustomerFields() {
  const { info, hydrated, setName, setZone } = useCustomerInfo();

  return (
    <section className="mt-2 px-4 pb-2" aria-labelledby="customer-fields-heading">
      <h2
        id="customer-fields-heading"
        className="font-sans text-[13px] font-medium text-fg"
      >
        Tus datos
      </h2>
      <p className="mt-0.5 font-sans text-[11px] text-fg-muted">
        Opcional · ayudan a Shirley a confirmar tu pedido más rápido.
      </p>

      <div className="mt-3 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="customer-name">Nombre</Label>
          <Input
            id="customer-name"
            type="text"
            inputMode="text"
            autoComplete="name"
            maxLength={MAX_LEN}
            placeholder="Cómo te llamas"
            value={hydrated ? info.name : ''}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer-zone">Zona o colonia</Label>
          <Input
            id="customer-zone"
            type="text"
            inputMode="text"
            autoComplete="address-level2"
            maxLength={MAX_LEN}
            placeholder="Para estimar el envío"
            value={hydrated ? info.zone : ''}
            onChange={(e) => setZone(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
