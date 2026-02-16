import { BadgeCheck, Building2, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useReveal } from '../../hooks/useReveal';
import { type TrustSignalsProps } from '../../types/landing';

const ICONS = [BadgeCheck, Building2, ShieldCheck] as const;

export function TrustSignals({ copy }: TrustSignalsProps) {
  const { ref, isVisible } = useReveal<HTMLElement>(0.18);

  return (
    <section ref={ref} className="px-4 py-22 sm:px-6" id="trust">
      <div className="mx-auto w-full max-w-[1280px]">
        <h2
          className={cn(
            'reveal max-w-4xl font-headline text-[clamp(2rem,4.2vw,3rem)] leading-[0.95] font-bold tracking-[-0.024em] text-[var(--text)]',
            isVisible && 'reveal-visible',
          )}
        >
          {copy.title}
        </h2>
        <p className={cn('reveal mt-4 max-w-3xl text-base leading-relaxed text-[var(--muted)]', isVisible && 'reveal-visible')}>
          {copy.subtitle}
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {copy.cards.map((card, index) => {
            const Icon = ICONS[index] ?? BadgeCheck;

            return (
              <article
                key={card.title}
                className={cn(
                  'reveal rounded-lg border-2 border-[var(--text)] bg-white p-6',
                  index % 2 === 0 ? 'reveal-left' : 'reveal-right',
                  isVisible && 'reveal-visible',
                )}
                style={{ transitionDelay: `${index * 110}ms` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xs font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">{card.title}</h3>
                  <div className="flex size-9 items-center justify-center rounded-full border border-[var(--text)] bg-[var(--accent)]">
                    <Icon size={16} />
                  </div>
                </div>
                <p className="mt-4 font-headline text-[clamp(2rem,5vw,3rem)] leading-none font-extrabold tracking-[-0.03em]">
                  {card.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{card.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
