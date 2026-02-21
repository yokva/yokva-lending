import { ArrowRight, Sparkles } from 'lucide-react'
import { captureEvent } from '../../lib/analytics'
import { type HeroProps } from '../../types/landing'

export function Hero({ copy }: HeroProps) {
  return (
    <section id="top" className="overflow-x-clip px-4 pt-24 pb-12 sm:px-6 md:pt-28 md:pb-14">
      <div className="mx-auto w-full max-w-[1280px] min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">{copy.kicker}</p>

        <h1 className="mt-4 max-w-[18ch] text-balance font-headline text-[clamp(1.9rem,9.5vw,3.75rem)] leading-[0.9] font-extrabold tracking-[-0.028em] text-[var(--text)]">
          <span className="font-headline">Stop losing </span>
          <span className="font-editorial text-[0.9em] text-[var(--accent)] italic whitespace-nowrap">$2,400/mo</span>
          <span className="font-headline"> on vacant units.</span>
        </h1>

        <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-[var(--muted)]">{copy.subtitle}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#demo"
            onClick={() => captureEvent('hero_cta_clicked', { location: 'hero' })}
            className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-[var(--text)] bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--text)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            <Sparkles size={16} strokeWidth={3} />
            {copy.cta}
            <ArrowRight size={18} strokeWidth={3} />
          </a>
          <span className="rounded-full border border-[var(--text)] px-4 py-2 text-xs font-semibold tracking-[0.1em] text-[var(--text)] uppercase">
            {copy.freeNote}
          </span>
        </div>
      </div>
    </section>
  )
}
