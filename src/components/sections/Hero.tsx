import { ArrowRight, Sparkles } from 'lucide-react'
import { type HeroProps } from '../../types/landing'

export function Hero({ copy }: HeroProps) {
  return (
    <section id="top" className="px-4 pt-26 pb-12 sm:px-6 md:pt-30 md:pb-14">
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">{copy.kicker}</p>

        <h1 className="mt-4 max-w-[13.2ch] font-headline text-[clamp(2.1rem,5.3vw,4.15rem)] leading-[0.86] font-extrabold tracking-[-0.03em] text-[var(--text)]">
          <span className="font-headline">Stop losing </span>
          <span className="font-editorial text-[var(--accent)] italic">$2,400/mo</span>
          <br className="hidden md:block" />
          <span className="font-headline whitespace-nowrap">on vacant units.</span>
        </h1>

        <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-[var(--muted)]">{copy.subtitle}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#demo"
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
