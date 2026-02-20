import { Cpu, Download, Upload } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useReveal } from '../../hooks/useReveal';
import { type HowItWorksProps } from '../../types/landing';

const ICONS = [Upload, Cpu, Download] as const;

export function HowItWorks({ copy }: HowItWorksProps) {
  const { ref, isVisible } = useReveal<HTMLElement>(0.2);

  return (
    <section ref={ref} className="px-4 py-22 sm:px-6" id="how-it-works">
      <div className="mx-auto w-full max-w-[1280px]">
        <h2 className={cn('reveal font-headline text-[clamp(2rem,4.3vw,3.2rem)] leading-[0.95] font-bold tracking-[-0.025em]', isVisible && 'reveal-visible')}>
          {copy.title}
        </h2>

        <div className="relative mt-9">
          <div className="pointer-events-none absolute top-[4.25rem] right-[15%] left-[15%] hidden h-[2px] bg-[color:rgb(17_17_17_/_0.18)] lg:block" />

          <div className="grid gap-4 lg:grid-cols-3">
            {copy.steps.map((step, index) => {
              const Icon = ICONS[index] ?? Upload;

              return (
                <article
                  key={step.number}
                  className={cn(
                    'reveal rounded-lg border-2 border-[var(--text)] bg-white p-6',
                    index % 2 === 0 ? 'reveal-left' : 'reveal-right',
                    isVisible && 'reveal-visible',
                  )}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="inline-flex rounded-full border border-[var(--text)] bg-[var(--text)] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[var(--accent)] uppercase">
                    {step.number}
                  </div>

                  <div className="mt-5 flex size-14 items-center justify-center rounded-lg border-2 border-[var(--text)] bg-[var(--bg)]">
                    <Icon size={24} strokeWidth={3} />
                  </div>

                  <h3 className="mt-6 font-headline text-2xl leading-[1.05] font-bold tracking-[-0.02em] text-[var(--text)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[var(--muted)]">{step.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
