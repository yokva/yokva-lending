import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { useReveal } from '../../hooks/useReveal'
import { type ProblemBentoProps } from '../../types/landing'

export function ProblemBento({ copy }: ProblemBentoProps) {
  const { ref, isVisible } = useReveal<HTMLElement>(0.2)

  return (
    <section ref={ref} className="border-y-2 border-[var(--text)] bg-white px-4 py-20 sm:px-6" id="problem">
      <div className="mx-auto w-full max-w-[1280px]">
        <h2
          className={cn(
            'reveal font-headline text-[clamp(2rem,4.2vw,3.1rem)] leading-[0.95] font-bold tracking-[-0.025em]',
            isVisible && 'reveal-visible',
          )}
        >
          {copy.title}
        </h2>

        <div className="mt-8 grid gap-4 md:grid-cols-12 md:auto-rows-[minmax(170px,auto)]">
          <article
            className={cn(
              'reveal reveal-left rounded-lg border-2 border-[var(--text)] bg-[var(--text)] p-6 text-white md:col-span-6 md:row-span-2 md:p-8',
              isVisible && 'reveal-visible',
            )}
          >
            <p className="font-headline text-[clamp(4rem,10vw,7rem)] leading-[0.86] font-extrabold tracking-[-0.04em]">{copy.leadValue}</p>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-white/82">{copy.leadText}</p>
          </article>

          <article
            className={cn(
              'reveal reveal-right rounded-lg border-2 border-[var(--text)] bg-[var(--bg)] p-6 md:col-span-3',
              isVisible && 'reveal-visible',
            )}
            style={{ transitionDelay: '70ms' }}
          >
            <p className="font-headline text-[clamp(1.9rem,4.2vw,2.9rem)] leading-none font-extrabold tracking-[-0.03em] text-[var(--text)]">
              {copy.vacancyValue}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{copy.vacancyText}</p>
          </article>

          <article
            className={cn(
              'reveal reveal-right rounded-lg border-2 border-[var(--text)] bg-[var(--bg)] p-6 md:col-span-3',
              isVisible && 'reveal-visible',
            )}
            style={{ transitionDelay: '140ms' }}
          >
            <p className="font-headline text-[clamp(1.9rem,4.2vw,2.9rem)] leading-none font-extrabold tracking-[-0.03em] text-[var(--text)]">
              {copy.proPhotoValue}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{copy.proPhotoText}</p>
          </article>

          <article
            className={cn(
              'reveal reveal-left rounded-lg border-2 border-[var(--text)] bg-[var(--bg)] p-6 md:col-span-6',
              isVisible && 'reveal-visible',
            )}
            style={{ transitionDelay: '200ms' }}
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">Response speed</p>
            <div className="mt-2">
              <p className="font-headline text-[clamp(2.4rem,6vw,4rem)] leading-[0.9] font-extrabold tracking-[-0.035em] text-[var(--text)]">
                {copy.speedValue}
              </p>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">{copy.speedText}</p>
          </article>

          <article
            className={cn(
              'reveal reveal-pop rounded-lg border-2 border-[var(--text)] bg-white p-6 md:col-span-6',
              isVisible && 'reveal-visible',
            )}
            style={{ transitionDelay: '270ms' }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
              <AlertTriangle size={14} />
              {copy.impactTitle}
            </div>

            <ul className="mt-4 space-y-2 text-sm text-[var(--text)]">
              {copy.impactBullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 rounded-full bg-[var(--accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  )
}
