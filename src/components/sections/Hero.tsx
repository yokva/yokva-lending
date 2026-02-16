import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { type HeroProps } from '../../types/landing'

export function Hero({ copy }: HeroProps) {
  const variants = useMemo(
    () => (copy.line2AccentVariants.length ? copy.line2AccentVariants : [copy.line2Accent]),
    [copy.line2Accent, copy.line2AccentVariants],
  )
  const [wordIndex, setWordIndex] = useState(0)
  const [typedWord, setTypedWord] = useState(variants[0] ?? '')
  const [isDeleting, setIsDeleting] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setPrefersReducedMotion(mediaQuery.matches)
    updateMotion()

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateMotion)
      return () => mediaQuery.removeEventListener('change', updateMotion)
    }

    mediaQuery.addListener(updateMotion)
    return () => mediaQuery.removeListener(updateMotion)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) {
      return
    }

    const currentWord = variants[wordIndex] ?? variants[0] ?? copy.line2Accent
    const isTypingForward = !isDeleting
    const isDoneTyping = typedWord === currentWord
    const isDoneDeleting = typedWord.length === 0
    let nextDelay = isTypingForward ? 80 : 45

    if (isTypingForward && isDoneTyping) {
      nextDelay = 1100
    }

    if (!isTypingForward && isDoneDeleting) {
      nextDelay = 170
    }

    const timeoutId = window.setTimeout(() => {
      if (isTypingForward) {
        if (!isDoneTyping) {
          setTypedWord(currentWord.slice(0, typedWord.length + 1))
          return
        }
        setIsDeleting(true)
        return
      }

      if (!isDoneDeleting) {
        setTypedWord(currentWord.slice(0, Math.max(0, typedWord.length - 1)))
        return
      }

      setIsDeleting(false)
      setWordIndex((previous) => (previous + 1) % variants.length)
    }, nextDelay)

    return () => window.clearTimeout(timeoutId)
  }, [copy.line2Accent, isDeleting, prefersReducedMotion, typedWord, variants, wordIndex])

  const displayWord = prefersReducedMotion ? (variants[0] ?? copy.line2Accent) : typedWord

  return (
    <section id="top" className="px-4 pt-26 pb-12 sm:px-6 md:pt-30 md:pb-14">
      <div className="mx-auto w-full max-w-[1280px]">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">{copy.kicker}</p>

        <h1 className="mt-4 max-w-6xl font-headline text-[clamp(2.05rem,5.15vw,3.95rem)] leading-[0.93] font-extrabold tracking-[-0.026em] text-[var(--text)]">
          <span className="block">{copy.line1}</span>
          <span
            aria-hidden="true"
            className="font-editorial block text-[clamp(2rem,5.02vw,3.85rem)] leading-[0.92] font-normal italic tracking-[-0.014em] text-[var(--text)]"
          >
            {copy.line2Prefix}
            <span className="hero-typeword text-[var(--accent)]">
              {displayWord || '\u00a0'}
            </span>
          </span>
          <span className="sr-only">
            {copy.line2Prefix}
            {variants[0]}
            {copy.line2Suffix}
          </span>
          <span className="block">{copy.line3}</span>
        </h1>

        <p className="mt-6 max-w-3xl text-[17px] leading-relaxed text-[var(--muted)]">{copy.subtitle}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#demo"
            className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-[var(--text)] bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--text)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            <Sparkles size={16} strokeWidth={2.4} />
            {copy.cta}
            <ArrowRight size={18} strokeWidth={2.2} />
          </a>
          <span className="rounded-full border border-[var(--text)] px-4 py-2 text-xs font-semibold tracking-[0.1em] text-[var(--text)] uppercase">
            {copy.freeNote}
          </span>
        </div>
      </div>
    </section>
  )
}
