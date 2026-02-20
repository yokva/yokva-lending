import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useReveal } from '../../hooks/useReveal'
import { type PricingProps } from '../../types/landing'

export function Pricing({ copy }: PricingProps) {
  const { ref, isVisible } = useReveal<HTMLElement>(0.2)

  return (
    <section ref={ref} className="border-y-2 border-[var(--text)] bg-white px-4 py-22 sm:px-6" id="pricing">
      <div className="mx-auto w-full max-w-[1280px]">
        <div className={cn('reveal flex justify-start', isVisible && 'reveal-visible')}>
          <span className="rounded-full border-2 border-[var(--text)] bg-[var(--accent)] px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--text)] uppercase">
            {copy.badge}
          </span>
        </div>

        <h2
          className={cn(
            'reveal mt-5 max-w-4xl font-headline text-[clamp(2rem,4.2vw,3.2rem)] leading-[0.95] font-bold tracking-[-0.025em] text-[var(--text)]',
            isVisible && 'reveal-visible',
          )}
        >
          {copy.title}
        </h2>
        <p className={cn('reveal mt-3 max-w-2xl text-base leading-relaxed text-[var(--muted)]', isVisible && 'reveal-visible')}>
          {copy.subtitle}
        </p>

        <div className="mt-9 grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
          {copy.plans.map((plan, index) => {
            const isInverted = plan.inverted

            return (
              <article
                key={plan.name}
                className={cn(
                  'reveal relative flex h-full flex-col rounded-lg border-2 border-[var(--text)] p-6',
                  index % 3 === 0 ? 'reveal-left' : index % 3 === 1 ? 'reveal-pop' : 'reveal-right',
                  isInverted ? 'bg-[var(--text)] text-white' : 'bg-[var(--bg)] text-[var(--text)]',
                  isVisible && 'reveal-visible',
                )}
                style={{ transitionDelay: `${index * 110}ms` }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-5 rounded-full border border-[var(--text)] bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-[var(--text)] uppercase">
                    {copy.popularLabel}
                  </span>
                )}

                <p className={cn('text-xs font-semibold tracking-[0.12em] uppercase', isInverted ? 'text-white/70' : 'text-[var(--muted)]')}>
                  {plan.name}
                </p>

                <div className="mt-3">
                  <span className="font-headline text-[clamp(2rem,4.5vw,3rem)] leading-none font-extrabold tracking-[-0.03em]">
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <p className={cn('mt-1 text-sm', isInverted ? 'text-white/80' : 'text-[var(--muted)]')}>{plan.period}</p>
                  ) : null}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={`${plan.name}-${feature}`} className="flex items-start gap-2 text-sm leading-relaxed">
                      <Check size={16} className={cn('mt-[2px] shrink-0', isInverted ? 'text-white' : 'text-[var(--text)]')} />
                      <span className={cn(isInverted ? 'text-white/82' : 'text-[var(--muted)]')}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#waitlist"
                  className={cn(
                    'focus-ring mt-7 inline-flex rounded-full border-2 border-[var(--text)] px-5 py-3 text-sm font-semibold transition-colors',
                    plan.popular
                      ? 'bg-[var(--accent)] text-[var(--text)] hover:bg-[var(--accent-strong)]'
                      : isInverted
                        ? 'bg-white text-[var(--text)] hover:bg-[var(--bg)]'
                        : 'bg-[var(--text)] text-white hover:bg-black',
                  )}
                >
                  {plan.cta}
                </a>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
