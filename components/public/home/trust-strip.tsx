import { MessageCircle, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  {
    Icon: ShieldCheck,
    title: 'Empaque discreto',
    body: 'Sin marcas en el exterior. Tu privacidad es la prioridad.',
  },
  {
    Icon: Truck,
    title: 'Entrega local',
    body: 'Coordinamos día y zona contigo por WhatsApp.',
  },
  {
    Icon: MessageCircle,
    title: 'Atención personal',
    body: 'Una sola persona te atiende, de mujer a mujer.',
  },
] as const;

export function TrustStrip() {
  return (
    <section className="px-4 pt-10">
      <ul className="rounded-xl border border-border/60 bg-surface-alt/60 p-5">
        {ITEMS.map((item, idx) => (
          <li
            key={item.title}
            className={
              idx === 0
                ? 'flex items-start gap-3'
                : 'mt-4 flex items-start gap-3 border-t border-border/60 pt-4'
            }
          >
            <span
              aria-hidden
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
            >
              <item.Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[13px] font-medium text-fg">
                {item.title}
              </p>
              <p className="mt-0.5 font-sans text-[12px] leading-relaxed text-fg-muted">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
